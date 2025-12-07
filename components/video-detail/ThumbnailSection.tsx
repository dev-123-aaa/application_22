"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerThumbnailGeneration } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ThumbnailSectionProps {
  thumbnails?: string[];
  scriptApproved: boolean;
  projectId: string;
  onGenerateStart?: () => void;
  onGenerateSuccess?: () => void;
  onGenerateError?: (error: string) => void;
}

export function ThumbnailSection({
  thumbnails,
  scriptApproved,
  projectId,
  onGenerateStart,
  onGenerateSuccess,
  onGenerateError,
}: ThumbnailSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasThumbnails = thumbnails && thumbnails.length > 0;

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    if (onGenerateStart) {
      onGenerateStart();
    }

    const result = await triggerThumbnailGeneration(projectId);

    if (result.success) {
      if (onGenerateSuccess) {
        onGenerateSuccess();
      }
    } else {
      if (onGenerateError) {
        onGenerateError(result.error || "Failed to generate thumbnails");
      }
    }

    setIsGenerating(false);
  };

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-400">
          Thumbnail Suggestions
        </h3>

        {/* Generate/Regenerate button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          disabled={!scriptApproved || isGenerating}
          className={cn(
            "gap-2",
            scriptApproved && !isGenerating && "text-cyan-400 hover:text-cyan-300"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : hasThumbnails ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              Generate Thumbnails
            </>
          )}
        </Button>
      </div>

      {!scriptApproved && !hasThumbnails && (
        <p className="text-xs text-gray-500 mb-4">
          Approve the script to enable thumbnail generation
        </p>
      )}

      {hasThumbnails ? (
        <div className="space-y-4">
          {/* Main selected thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-700">
            <Image
              src={thumbnails[selectedIndex]}
              alt={`Thumbnail option ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Thumbnail grid selector */}
          {thumbnails.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {thumbnails.map((thumb, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-md border-2 transition-all",
                    index === selectedIndex
                      ? "border-cyan-500 ring-2 ring-cyan-500/20"
                      : "border-zinc-700 hover:border-zinc-500"
                  )}
                >
                  <Image
                    src={thumb}
                    alt={`Thumbnail option ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-950/30 py-12 text-center">
          <div className="mb-3 rounded-full bg-zinc-800/50 p-3">
            <ImageIcon className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            No thumbnails generated yet
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {scriptApproved
              ? "Click 'Generate Thumbnails' to create thumbnail suggestions"
              : "Approve the script first to generate thumbnails"}
          </p>
        </div>
      )}
    </div>
  );
}
