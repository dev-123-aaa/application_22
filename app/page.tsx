"use client";

import { useEffect, useCallback, useRef } from "react";
import { VideoList } from "@/components/dashboard/VideoList";
import { useVideos } from "@/lib/contexts/VideoContext";
import { useChannel } from "@/components/channel/ChannelProvider";
import { fetchProjects } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL = 10000; // 10 seconds

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

  const loadProjects = useCallback(async (channelId: string | undefined, showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);

    const result = await fetchProjects(channelId);

    if (result.success && result.projects) {
      const videoList = result.projects.map(projectToVideo);
      setVideos(videoList);
    } else {
      setError(result.error || "Failed to load projects");
    }

    if (showLoadingState) {
      setIsLoading(false);
    }
  }, [setVideos, setIsLoading, setError]);

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

    const hasInProgressProjects = videos.some((v) => isProjectInProgress(v.status));

    if (!hasInProgressProjects || isLoading) {
      return;
    }

    const channelId = selectedChannel?.channel_id || undefined;
    const intervalId = setInterval(() => {
      loadProjects(channelId, false); // Don't show loading state for background refresh
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [videos, isLoading, selectedChannel, isChannelLoading, loadProjects]);

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

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
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
        <VideoList
          videos={videos}
          isLoading={isLoading}
          emptyMessage={
            selectedChannel
              ? `No videos yet for ${selectedChannel.name}. Click 'New Video' to start your first production.`
              : undefined
          }
        />
      )}
    </main>
  );
}
