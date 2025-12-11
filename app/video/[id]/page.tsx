"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProject } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { VideoHeader } from "@/components/video-detail/VideoHeader";
import { OverviewCard } from "@/components/video-detail/OverviewCard";
import { ScriptSection } from "@/components/video-detail/ScriptSection";
import { VideoGenerationSection } from "@/components/video-detail/VideoGenerationSection";
import { ThumbnailSection } from "@/components/video-detail/ThumbnailSection";
import { PipelineStatus } from "@/components/video-detail/PipelineStatus";
import { SectionProgress } from "@/components/video-detail/SectionProgress";
import { Toast } from "@/components/ui/toast";

const POLL_INTERVAL = 10000; // 10 seconds

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
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const isInitialLoad = useRef(true);

  const loadProject = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);
    setNotFound(false);

    const result = await fetchProject(id);

    if (result.success && result.project) {
      setVideo(projectToVideo(result.project));
    } else if (result.error === "Project not found") {
      setNotFound(true);
    } else {
      setError(result.error || "Failed to load project");
    }

    if (showLoadingState) {
      setIsLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadProject(true);
    }
  }, [loadProject]);

  // Polling for updates when project is in progress
  useEffect(() => {
    if (!video || !isProjectInProgress(video.status, video.video_status) || isLoading) {
      return;
    }

    const intervalId = setInterval(() => {
      loadProject(false); // Don't show loading state for background refresh
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [video, isLoading, loadProject]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/50 py-16 text-center">
          <Loader2 className="mb-4 h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-gray-400">Loading project...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with back button, title, and metadata */}
      <VideoHeader video={video} />

      {/* Content sections */}
      <div className="space-y-6">
        {/* Overview Card - Video metadata */}
        <OverviewCard video={video} />

        {/* Section Progress (shown when in Sections in creation status) */}
        {video.status === "Sections in creation" && video.total_sections > 0 && (
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
            <SectionProgress
              currentSection={video.current_section}
              totalSections={video.total_sections}
            />
          </div>
        )}

        {/* Script Section with Google Doc link */}
        <ScriptSection
          scriptUrl={video.script_url}
          status={video.status}
          scriptStatus={video.script_status}
          projectId={video.project_id}
          onStatusChange={(newStatus) => {
            setVideo({ ...video, script_status: newStatus });
            if (newStatus === "approved") {
              showToast("Script approved");
            } else if (newStatus === "draft") {
              showToast("Script marked as draft");
            } else {
              showToast("Script status updated");
            }
          }}
          onStatusError={(error) => showToast(error, "error")}
        />

        {/* Video Generation Section */}
        <VideoGenerationSection
          projectId={video.project_id}
          scriptStatus={video.script_status}
          videoStatus={video.video_status}
          videoDriveFolder={video.video_drive_folder}
          onGenerationStart={() => {
            setVideo({ ...video, video_status: "Section Chunking" });
          }}
          onSuccess={() => showToast("Video generation started")}
          onError={(error) => showToast(error, "error")}
        />

        {/* Thumbnail Section */}
        <ThumbnailSection
          thumbnails={video.thumbnail_suggestions}
          scriptStatus={video.script_status}
          projectId={video.project_id}
          onGenerateStart={() => showToast("Generating thumbnails...", "info")}
          onGenerateSuccess={() => {
            showToast("Thumbnail generation started");
            loadProject(false);
          }}
          onGenerateError={(error) => showToast(error, "error")}
        />

        {/* Pipeline Status Stepper */}
        <PipelineStatus status={video.status} videoStatus={video.video_status} />
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </main>
  );
}
