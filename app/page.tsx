"use client";

import { useEffect } from "react";
import { VideoList } from "@/components/dashboard/VideoList";
import { useVideos } from "@/lib/contexts/VideoContext";
import { fetchProjects } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Convert database Project to Video type
function projectToVideo(project: Project): Video {
  return {
    project_id: project.project_id,
    title: project.title,
    status: project.status as Video["status"],
    created_at: project.created_at,
    total_sections: project.total_sections || 0,
    duration_hours: project.duration_hours,
    duration_minutes: project.duration_minutes,
    main_characters: project.main_characters || "",
    primary_locations: project.primary_locations || "",
    central_theme: project.central_theme || "",
    tone: project.tone || "",
    script: project.script || undefined,
    thumbnail_suggestions: project.thumbnail_suggestions || undefined,
  };
}

export default function DashboardPage() {
  const { videos, setVideos, isLoading, setIsLoading, error, setError } = useVideos();

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchProjects();

    if (result.success && result.projects) {
      const videoList = result.projects.map(projectToVideo);
      setVideos(videoList);
    } else {
      setError(result.error || "Failed to load projects");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-extralight tracking-wide text-white">
          Video Projects
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading
            ? "Loading projects..."
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
          <Button variant="outline" className="gap-2" onClick={loadProjects}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : (
        <VideoList videos={videos} isLoading={isLoading} />
      )}
    </main>
  );
}
