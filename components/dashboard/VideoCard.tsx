"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, Trash2, Loader2, Film } from "lucide-react";
import { Video } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/api";
import { useVideos } from "@/lib/contexts/VideoContext";

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(hours: number, minutes: number): string {
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper function for status colors (for compact mode)
function getStatusColorClass(status: string): string {
  const colors: Record<string, string> = {
    "draft": "bg-blue-500/20 text-blue-300",
    "sections_in_creation": "bg-purple-500/20 text-purple-300",
    "voiceover": "bg-amber-500/20 text-amber-300",
    "video_generation": "bg-cyan-500/20 text-cyan-300",
    "published": "bg-emerald-500/20 text-emerald-300",
    "failed": "bg-red-500/20 text-red-300",
    "pending": "bg-gray-500/20 text-gray-300",
  };
  return colors[status.toLowerCase()] || "bg-gray-500/20 text-gray-300";
}

export function VideoCard({ video, compact = false }: VideoCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeVideo } = useVideos();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);

    const result = await deleteProject(video.project_id);

    if (result.success) {
      removeVideo(video.project_id);
    } else {
      console.error("Failed to delete project:", result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  // Compact mode for grid view
  if (compact) {
    if (showConfirm) {
      return (
        <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-sm border border-red-500/30 rounded-2xl">
          <p className="text-sm text-white mb-2">Delete &quot;{video.title}&quot;?</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {isDeleting ? "..." : "Delete"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
        <Link
          href={`/video/${video.project_id}`}
          className="block h-full"
        >
          <div className="p-4 h-full">
            {/* Thumbnail/Icon */}
            <div className="w-full aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center mb-3">
              <Film className="h-8 w-8 text-gray-400" />
            </div>
            
            {/* Title */}
            <h3 className="font-medium text-white truncate mb-2 group-hover:text-cyan-50">
              {video.title}
            </h3>
            
            {/* Theme */}
            <p className="text-xs text-gray-400 truncate mb-3">
              {video.central_theme || "No theme specified"}
            </p>
            
            {/* Status and date */}
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                getStatusColorClass(video.status)
              )}>
                {video.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(video.created_at)}
              </span>
            </div>
            
            {/* Progress bar if applicable */}
            {video.current_section > 0 && video.total_sections > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((video.current_section / video.total_sections) * 100)}%</span>
                </div>
                <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(video.current_section / video.total_sections) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Delete button - positioned absolutely */}
            <button
              onClick={handleDeleteClick}
              className={cn(
                "absolute top-3 right-3 p-1.5 rounded-md",
                "bg-gray-800/80 backdrop-blur-sm",
                "text-gray-500 hover:text-red-400 hover:bg-red-500/20",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              )}
              title="Delete project"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </Link>
      </div>
    );
  }

  // Original list view mode (your existing code)
  if (showConfirm) {
    return (
      <div
        className={cn(
          "w-full rounded-lg border border-red-500/30 bg-red-500/5 p-4"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">
              Are you sure you want to delete &quot;{video.title}&quot;?
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative w-full rounded-lg border border-zinc-800/50 bg-zinc-900/50 transition-all duration-200",
        "hover:border-cyan-500/30 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-cyan-500/5"
      )}
    >
      <Link
        href={`/video/${video.project_id}`}
        className="block p-4"
      >
        <div className="flex items-center gap-4">
          {/* Title - takes available space */}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-normal text-white group-hover:text-cyan-50">
              {video.title}
            </h3>
          </div>

          {/* Status, Duration, Date, and Delete in a row */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <StatusBadge status={video.status} />

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDuration(video.duration_hours, video.duration_minutes)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 min-w-[90px]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(video.created_at)}</span>
            </div>

            {/* Delete button - inline, always in the row */}
            <button
              onClick={handleDeleteClick}
              className={cn(
                "p-2 rounded-md flex-shrink-0",
                "text-gray-500 hover:text-red-400 hover:bg-red-500/10",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              )}
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
