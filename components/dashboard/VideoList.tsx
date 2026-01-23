"use client";

import { Video } from "@/lib/types";
import { VideoCard } from "./VideoCard";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { Button } from "@/components/ui/button";
import { Plus, Film, Grid3x3, List } from "lucide-react";
import { useVideos } from "@/lib/contexts/VideoContext";
import { cn } from "@/lib/utils";

interface VideoListProps {
  videos: Video[];
  isLoading?: boolean;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
}

export function VideoList({ 
  videos, 
  isLoading = false, 
  emptyMessage,
  viewMode = 'list' // Default to list view
}: VideoListProps) {
  const { openModal } = useVideos();

  if (isLoading) {
    // Show different skeletons based on view mode
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      );
    }
    
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700/50 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm py-16 px-4 text-center">
        <div className="mb-4 rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 border border-gray-700/50">
          <Film className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-light text-white">No videos yet</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-400">
          {emptyMessage || "Click 'New Video' to start your first production."}
        </p>
        <Button 
          variant="outline" 
          className="gap-2 border-gray-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-300 hover:text-white transition-colors"
          onClick={openModal}
        >
          <Plus className="h-4 w-4" />
          Create your first video
        </Button>
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.project_id}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <VideoCard video={video} compact />
          </div>
        ))}
      </div>
    );
  }

  // List view (default)
  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <VideoCard key={video.project_id} video={video} />
      ))}
    </div>
  );
}
