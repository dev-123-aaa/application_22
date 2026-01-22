"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProject } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { VideoHeader } from "@/components/video-detail/VideoHeader";
import { OverviewCard } from "@/components/video-detail/OverviewCard";
import { ScriptSection } from "@/components/video-detail/ScriptSection";
import { VoiceoverSection } from "@/components/video-detail/VoiceoverSection";
import { VideoGenerationSection } from "@/components/video-detail/VideoGenerationSection";
import { ThumbnailSection } from "@/components/video-detail/ThumbnailSection";
import { PipelineStatus } from "@/components/video-detail/PipelineStatus";
import { SectionProgress } from "@/components/video-detail/SectionProgress";
import { Toast } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const POLL_INTERVAL = 10000; // 10 seconds
const DEBOUNCE_DELAY = 500; // Debounce delay

// Fixed: Properly typed debounce utility function
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface VideoDetailPageProps {
  params: { id: string };
}

// Convert database Project to Video type
function projectToVideo(project: Project): Video {
  return {
    project_id: project.project_id,
    title: project.title,
    status: project.status as Video["status"],
    created_at: project.created_at,
    total_sections: project.total_sections || 0,
    current_section: project.current_section || 0,
    duration_hours: project.duration_hours,
    duration_minutes: project.duration_minutes,
    main_characters: project.main_characters || "",
    primary_locations: project.primary_locations || "",
    central_theme: project.central_theme || "",
    tone: project.tone || "",
    script_url: project.script_url || undefined,
    script_status: project.script_status || "pending",
    voiceover_status: project.voiceover_status || "pending",
    voiceover_drive_folder: project.voiceover_drive_folder || null,
    thumbnail_suggestions: project.thumbnail_suggestions || undefined,
    video_status: project.video_status || null,
    video_drive_folder: project.video_drive_folder || null,
  };
}

// Check if a project is in progress (not finished or failed)
function isProjectInProgress(status: string, videoStatus: string | null): boolean {
  const isScriptInProgress = !["Published", "Failed"].includes(status);
  const isVideoInProgress = videoStatus && ["Section Chunking", "Rendering", "Finalizing"].includes(videoStatus);
  return isScriptInProgress || !!isVideoInProgress;
}

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = params;
  
  // Add document title
  useEffect(() => {
    document.title = "Loading... - Video Dashboard";
    return () => {
      document.title = "Video Dashboard"; // Reset on unmount
    };
  }, []);
  
  // Add scroll restoration
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // Add offline detection
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const isInitialLoad = useRef(true);
  
  // Add AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // Optimistic updates helper
  const updateVideoOptimistically = useCallback((updates: Partial<Video>) => {
    setVideo(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Memoize expensive calculation
  const isInProgress = useMemo(() => 
    video ? isProjectInProgress(video.status, video.video_status) : false,
    [video]
  );

  // Fixed: Added useCallback for showToast
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Add keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.history.back();
    }
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      loadProject(true);
    }
  }, [loadProject]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const loadProject = useCallback(async (showLoadingState = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);
    setNotFound(false);

    try {
      // Pass signal to fetchProject
      const result = await fetchProject(id, { signal: abortControllerRef.current.signal });

      if (result.success && result.project) {
        const newVideo = projectToVideo(result.project);
        setVideo(newVideo);
        
        // Update document title
        document.title = `${newVideo.title} - Video Dashboard`;
      } else if (result.error === "Project not found") {
        setNotFound(true);
      } else {
        setError(result.error || "Failed to load project");
      }
    } catch (err: unknown) {
      // Handle abort errors gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  }, [id]);

  // Debounced version for polling
  const debouncedLoadProject = useMemo(
    () => debounce((showLoadingState: boolean) => {
      loadProject(showLoadingState);
    }, DEBOUNCE_DELAY),
    [loadProject]
  );

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadProject(true);
    }
  }, [loadProject]);

  // Polling for updates when project is in progress
  useEffect(() => {
    if (!video || !isInProgress || isLoading) {
      return;
    }

    const intervalId = setInterval(() => {
      debouncedLoadProject(false); // Use debounced version
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [video, isLoading, isInProgress, debouncedLoadProject]);

  // Export functionality
  const exportProjectData = useCallback(() => {
    if (!video) return;
    
    const data = {
      ...video,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.title.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Project data exported', 'success');
  }, [video, showToast]);

  // Copy project ID
  const copyProjectId = useCallback(() => {
    if (!video) return;
    
    navigator.clipboard.writeText(video.project_id)
      .then(() => showToast('Project ID copied to clipboard', 'success'))
      .catch(() => showToast('Failed to copy', 'error'));
  }, [video, showToast]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <main 
        role="main" 
        aria-label="Loading video project"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Screen reader announcement */}
        <div role="status" aria-live="polite" className="sr-only">
          Loading project details...
        </div>
        
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Skeleton loader */}
        <div className="space-y-6">
          <div className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-80 bg-zinc-800 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-40 bg-zinc-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main 
        role="main" 
        aria-label="Error loading video project"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Screen reader announcement */}
        <div role="alert" aria-live="assertive" className="sr-only">
          Error loading project: {error}
        </div>
        
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 py-16 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-light text-white">Failed to load project</h2>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <Button variant="outline" className="gap-2" onClick={() => loadProject(true)}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </main>
    );
  }

  // Video not found state
  if (notFound || !video) {
    return (
      <main 
        role="main" 
        aria-label="Video not found"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/50 py-16 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-2 text-xl font-light text-white">Video Not Found</h2>
          <p className="mb-6 text-sm text-gray-500">
            The video you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main 
      role="main" 
      aria-label={`Video project: ${video.title}`}
      className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ You are offline. Some features may be unavailable.
          </p>
        </div>
      )}

      {/* Header with utility buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        {/* Utility buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={copyProjectId}
            title="Copy Project ID"
          >
            <Copy className="h-4 w-4" />
            Copy ID
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={exportProjectData}
            title="Export Project Data"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <VideoHeader video={video} />

      {/* Content sections wrapped in ErrorBoundary */}
      <div className="space-y-6">
        {/* Overview Card */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Overview failed to load</div>}>
          <OverviewCard video={video} />
        </ErrorBoundary>

        {/* Section Progress */}
        {video.status === "Sections in creation" && video.total_sections > 0 && (
          <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Progress tracking failed to load</div>}>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
              <SectionProgress
                currentSection={video.current_section}
                totalSections={video.total_sections}
              />
            </div>
          </ErrorBoundary>
        )}

        {/* Script Section */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Script section failed to load</div>}>
          <ScriptSection
            scriptUrl={video.script_url}
            status={video.status}
            scriptStatus={video.script_status}
            projectId={video.project_id}
            onStatusChange={(newStatus) => {
              // Use optimistic update
              updateVideoOptimistically({ script_status: newStatus });
              if (newStatus === "approved") {
                showToast("Script approved");
              } else if (newStatus === "draft") {
                showToast("Script marked as draft");
              } else {
                showToast("Script status updated");
              }
            }}
            onStatusError={(errorMsg) => showToast(errorMsg, "error")}
            onUrlChange={(url) => {
              updateVideoOptimistically({ script_url: url });
              showToast("Script URL saved");
            }}
          />
        </ErrorBoundary>

        {/* Voiceover Section */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Voiceover section failed to load</div>}>
          <VoiceoverSection
            video={video}
            onUpdate={() => debouncedLoadProject(false)} // Use debounced version
          />
        </ErrorBoundary>

        {/* Video Generation Section */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Video generation failed to load</div>}>
          <VideoGenerationSection
            projectId={video.project_id}
            scriptStatus={video.script_status}
            videoStatus={video.video_status}
            videoDriveFolder={video.video_drive_folder}
            onGenerationStart={() => {
              updateVideoOptimistically({ video_status: "Section Chunking" });
            }}
            onSuccess={() => showToast("Video generation started")}
            onError={(errorMsg) => showToast(errorMsg, "error")}
          />
        </ErrorBoundary>

        {/* Thumbnail Section */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Thumbnail section failed to load</div>}>
          <ThumbnailSection
            thumbnails={video.thumbnail_suggestions}
            scriptStatus={video.script_status}
            projectId={video.project_id}
            onGenerateStart={() => showToast("Generating thumbnails...", "info")}
            onGenerateSuccess={() => {
              showToast("Thumbnail generation started");
              debouncedLoadProject(false); // Use debounced version
            }}
            onGenerateError={(errorMsg) => showToast(errorMsg, "error")}
          />
        </ErrorBoundary>

        {/* Pipeline Status Stepper */}
        <ErrorBoundary fallback={<div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">Pipeline status failed to load</div>}>
          <PipelineStatus status={video.status} videoStatus={video.video_status} />
        </ErrorBoundary>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </main>
  );
}
