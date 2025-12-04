"use client";

import { Video } from "@/lib/types";
import { VideoCard } from "./VideoCard";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { Button } from "@/components/ui/button";
import { Plus, Film } from "lucide-react";
import { useVideos } from "@/lib/contexts/VideoContext";

interface VideoListProps {
  videos: Video[];
  isLoading?: boolean;
}

export function VideoList({ videos, isLoading = false }: VideoListProps) {
  const { openModal } = useVideos();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 py-16 px-4 text-center">
        <div className="mb-4 rounded-full bg-zinc-800/50 p-4">
          <Film className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="mb-2 text-lg font-light text-white">No videos yet</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-500">
          Click &apos;New Video&apos; to start your first production.
        </p>
        <Button variant="outline" className="gap-2" onClick={openModal}>
          <Plus className="h-4 w-4" />
          Create your first video
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <VideoCard key={video.project_id} video={video} />
      ))}
    </div>
  );
}
