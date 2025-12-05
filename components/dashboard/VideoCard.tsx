"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, Trash2, Loader2 } from "lucide-react";
import { Video } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/api";
import { useVideos } from "@/lib/contexts/VideoContext";

interface VideoCardProps {
  video: Video;
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

export function VideoCard({ video }: VideoCardProps) {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0 pr-10">
            <h3 className="truncate text-sm font-normal text-white group-hover:text-cyan-50">
              {video.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
            <StatusBadge status={video.status} />

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDuration(video.duration_hours, video.duration_minutes)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(video.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={handleDeleteClick}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md",
          "text-gray-500 hover:text-red-400 hover:bg-red-500/10",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}
        title="Delete project"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
