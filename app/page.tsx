"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { VideoList } from "@/components/dashboard/VideoList";
import { useVideos } from "@/lib/contexts/VideoContext";
import { useChannel } from "@/components/channel/ChannelProvider";
import { fetchProjects } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const POLL_INTERVAL = 10000; // 10 seconds
const DEBOUNCE_DELAY = 500; // Debounce delay

// Debounce utility function
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
function isProjectInProgress(status: string): boolean {
  return !["Published", "Failed"].includes(status);
}

export default function DashboardPage() {
  const { videos, setVideos, isLoading, setIsLoading, error, setError } = useVideos();
  const { selectedChannel, isLoading: isChannelLoading } = useChannel();
  const previousChannelId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // New state for enhancements
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [preferredChannel, setPreferredChannel] = useState<string | null>(null);

  // Load preferred channel from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-channel');
    if (saved) {
      setPreferredChannel(saved);
    }
  }, []);

  // Save preferred channel when channel changes
  useEffect(() => {
    if (selectedChannel?.channel_id) {
      localStorage.setItem('preferred-channel', selectedChannel.channel_id);
    }
  }, [selectedChannel]);

  // Update document title based on selected channel
  useEffect(() => {
    if (selectedChannel) {
      document.title = `${selectedChannel.name} - Video Dashboard`;
    } else {
      document.title = 'Video Dashboard';
    }
    return () => {
      document.title = 'Video Dashboard'; // Reset on unmount
    };
  }, [selectedChannel]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      loadProjects(selectedChannel?.channel_id, true);
    }
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Trigger "New Video" button if exists
      const newVideoBtn = document.querySelector('[data-new-video]');
      if (newVideoBtn instanceof HTMLElement) {
        newVideoBtn.click();
      }
    }
  }, [loadProjects, selectedChannel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Optimistic updates helper
  const updateVideoOptimistically = useCallback((projectId: string, updates: Partial<Video>) => {
    setVideos(prev => prev.map(video => 
      video.project_id === projectId ? { ...video, ...updates } : video
    ));
  }, [setVideos]);

  // Memoize expensive calculations
  const inProgressCount = useMemo(() => 
    videos.filter(v => isProjectInProgress(v.status)).length,
    [videos]
  );

  const hasInProgressProjects = useMemo(() => 
    videos.some((v) => isProjectInProgress(v.status)),
    [videos]
  );

  // Status counts for summary
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach(video => {
      counts[video.status] = (counts[video.status] || 0) + 1;
    });
    return counts;
  }, [videos]);

  const loadProjects = useCallback(async (channelId: string | undefined, showLoadingState = true) => {
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

    try {
      // Note: Update fetchProjects to accept signal parameter if needed
      const result = await fetchProjects(channelId);

      if (result.success && result.projects) {
        const videoList = result.projects.map(projectToVideo);
        setVideos(videoList);
        setLastUpdated(new Date());
        
        // Simple analytics tracking (optional)
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard loaded:', {
            channelId,
            projectCount: result.projects.length,
            inProgressCount: videoList.filter(v => isProjectInProgress(v.status)).length
          });
        }
      } else {
        setError(result.error || "Failed to load projects");
      }
    } catch (err: unknown) {
      // Handle abort errors gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  }, [setVideos, setIsLoading, setError]);

  // Debounced version for polling
  const debouncedLoadProjects = useMemo(
    () => debounce((channelId: string | undefined, showLoadingState: boolean) => {
      loadProjects(channelId, showLoadingState);
    }, DEBOUNCE_DELAY),
    [loadProjects]
  );

  // Load projects when channel changes
  useEffect(() => {
    if (isChannelLoading) return;

    const currentChannelId = selectedChannel?.channel_id || undefined;

    // Only reload if channel actually changed
    if (previousChannelId.current !== currentChannelId) {
      previousChannelId.current = currentChannelId || null;
      loadProjects(currentChannelId, true);
    }
  }, [selectedChannel, isChannelLoading, loadProjects]);

  // Polling for updates when there are in-progress projects
  useEffect(() => {
    if (isChannelLoading) return;

    if (!hasInProgressProjects || isLoading) {
      return;
    }

    const channelId = selectedChannel?.channel_id || undefined;
    const intervalId = setInterval(() => {
      debouncedLoadProjects(channelId, false); // Use debounced version
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [videos, isLoading, selectedChannel, isChannelLoading, debouncedLoadProjects, hasInProgressProjects]);

  // Show loading while channel is loading
  if (isChannelLoading) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading channels...</p>
        </div>
      </main>
    );
  }

  // Show skeleton loader for projects loading
  if (isLoading && videos.length === 0) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="mt-2 h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with refresh button and status summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extralight tracking-wide text-white">
            Video Projects
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading
              ? "Loading projects..."
              : selectedChannel
              ? `${videos.length} project${videos.length !== 1 ? "s" : ""} for ${selectedChannel.name}`
              : `${videos.length} project${videos.length !== 1 ? "s" : ""} in your production pipeline`}
          </p>
          
          {/* Status summary */}
          {!isLoading && videos.length > 0 && (
            <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span key={status} className="px-2 py-1 bg-zinc-800/50 rounded">
                  {count} {status.toLowerCase().replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
          
          {/* Last updated time */}
          {lastUpdated && !isLoading && (
            <p className="text-xs text-gray-500 mt-2">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        
        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-center"
          onClick={() => loadProjects(selectedChannel?.channel_id, true)}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 py-16 px-4 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-light text-white">Failed to load projects</h3>
          <p className="mb-6 max-w-sm text-sm text-gray-400">{error}</p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => loadProjects(selectedChannel?.channel_id, true)}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : (
        <ErrorBoundary fallback={
          <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-400 inline mr-2" />
            <span className="text-red-300">Failed to load video list</span>
          </div>
        }>
          <VideoList
            videos={videos}
            isLoading={isLoading}
            emptyMessage={
              selectedChannel ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
                  <p className="text-gray-400 mb-6">
                    Start your first video production for {selectedChannel.name}
                  </p>
                  <Button data-new-video>Create New Video</Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-lg font-medium text-white mb-2">Select a channel</h3>
                  <p className="text-gray-400">
                    Choose a channel to see its video projects
                  </p>
                </div>
              )
            }
          />
        </ErrorBoundary>
      )}
    </main>
  );
}
