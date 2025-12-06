"use client";

import { useState } from "react";
import {
  Video,
  AlertTriangle,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerVideoGeneration } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VideoGenerationSectionProps {
  projectId: string;
  scriptApproved: boolean;
  videoStatus: string | null;
  videoDriveFolder: string | null;
  onGenerationStart: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Video generation stages (excluding Failed)
const VIDEO_STAGES = ["Section Chunking", "Rendering", "Finalizing", "Video Finished"];

function getStageIndex(status: string | null): number {
  if (!status) return -1;
  return VIDEO_STAGES.indexOf(status);
}

function StageIndicator({
  stage,
  currentStatus,
  isFailed,
}: {
  stage: string;
  currentStatus: string | null;
  isFailed: boolean;
}) {
  const stageIndex = VIDEO_STAGES.indexOf(stage);
  const currentIndex = getStageIndex(currentStatus);

  const isCompleted = currentStatus && currentIndex > stageIndex;
  const isCurrent = currentStatus === stage && !isFailed;
  const isPending = !currentStatus || currentIndex < stageIndex;

  return (
    <div className="flex items-center gap-3">
      {/* Stage indicator */}
      <div
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
          isCompleted && "bg-emerald-500",
          isCurrent && "bg-cyan-500",
          isPending && "bg-zinc-700",
          isFailed && stage === currentStatus && "bg-red-500"
        )}
      >
        {isCompleted ? (
          <Check className="h-3.5 w-3.5 text-white" />
        ) : isCurrent ? (
          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        ) : isFailed && stage === currentStatus ? (
          <span className="text-white text-xs font-bold">!</span>
        ) : (
          <div className="h-2 w-2 rounded-full bg-zinc-500" />
        )}
      </div>

      {/* Stage label */}
      <span
        className={cn(
          "text-sm",
          isCompleted && "text-emerald-400",
          isCurrent && "text-cyan-400",
          isPending && "text-gray-500",
          isFailed && stage === currentStatus && "text-red-400"
        )}
      >
        {stage}
      </span>
    </div>
  );
}

export function VideoGenerationSection({
  projectId,
  scriptApproved,
  videoStatus,
  videoDriveFolder,
  onGenerationStart,
  onSuccess,
  onError,
}: VideoGenerationSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const isInProgress =
    videoStatus &&
    ["Section Chunking", "Rendering", "Finalizing"].includes(videoStatus);
  const isComplete = videoStatus === "Video Finished";
  const isFailed = videoStatus === "Video Failed";

  const handleGenerateVideo = async () => {
    setIsGenerating(true);

    const result = await triggerVideoGeneration(projectId);

    if (result.success) {
      onGenerationStart();
      onSuccess();
    } else {
      onError(result.error || "Failed to start video generation");
    }

    setIsGenerating(false);
  };

  // Determine button state and text
  const getButtonProps = () => {
    if (isGenerating) {
      return {
        disabled: true,
        children: (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ),
      };
    }

    if (isInProgress) {
      return {
        disabled: true,
        children: (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            In Progress...
          </>
        ),
      };
    }

    if (isFailed) {
      return {
        disabled: false,
        children: (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Video Generation
          </>
        ),
      };
    }

    if (isComplete) {
      return {
        disabled: false,
        children: (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Video
          </>
        ),
      };
    }

    return {
      disabled: !scriptApproved,
      children: (
        <>
          <Video className="mr-2 h-4 w-4" />
          Generate Video
        </>
      ),
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-xs font-light uppercase tracking-widest text-gray-400">
          Video Generation
        </h3>
        {isComplete && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400">
            Complete
          </span>
        )}
        {isInProgress && (
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-400">
            In Progress
          </span>
        )}
        {isFailed && (
          <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs text-red-400">
            Failed
          </span>
        )}
      </div>

      {/* Status Message */}
      <div className="mb-6">
        {!scriptApproved && !videoStatus && (
          <div className="flex items-start gap-3 rounded-md bg-amber-500/10 border border-amber-500/30 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200 font-medium">
                Script approval required
              </p>
              <p className="text-xs text-amber-200/70 mt-1">
                Approve the script above to enable video generation.
              </p>
            </div>
          </div>
        )}

        {scriptApproved && !videoStatus && (
          <div className="flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 p-4">
            <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-200 font-medium">
                Script approved
              </p>
              <p className="text-xs text-emerald-200/70 mt-1">
                Ready to generate video from your approved script.
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="flex items-start gap-3 rounded-md bg-red-500/10 border border-red-500/30 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200 font-medium">
                Video generation failed
              </p>
              <p className="text-xs text-red-200/70 mt-1">
                An error occurred during video generation. Please try again.
              </p>
            </div>
          </div>
        )}

        {(isInProgress || isComplete) && (
          <div className="flex items-start gap-3 rounded-md bg-cyan-500/10 border border-cyan-500/30 p-4">
            {isComplete ? (
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-spin" />
            )}
            <div>
              <p className="text-sm text-cyan-200 font-medium">
                {isComplete ? "Video Complete" : "Generating Video..."}
              </p>
              <p className="text-xs text-cyan-200/70 mt-1">
                {isComplete
                  ? "Your video sections are ready to download."
                  : "This may take several minutes. The page will update automatically."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Stages */}
      {(isInProgress || isComplete || isFailed) && (
        <div className="mb-6 rounded-md bg-zinc-950/50 p-4">
          <div className="space-y-3">
            {VIDEO_STAGES.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <StageIndicator
                  stage={stage}
                  currentStatus={videoStatus}
                  isFailed={isFailed}
                />
                {/* Connecting line */}
                {index < VIDEO_STAGES.length - 1 && (
                  <div
                    className={cn(
                      "absolute ml-3 mt-8 h-3 w-0.5",
                      getStageIndex(videoStatus) > index
                        ? "bg-emerald-500"
                        : "bg-zinc-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drive Folder Link */}
      {isComplete && videoDriveFolder && (
        <div className="mb-6">
          <a
            href={videoDriveFolder}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <FolderOpen className="h-5 w-5" />
            <span>View Section Videos</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateVideo}
        disabled={buttonProps.disabled}
        className={cn(
          "gap-2",
          !buttonProps.disabled && !isFailed && !isComplete && "bg-cyan-600 hover:bg-cyan-500"
        )}
      >
        {buttonProps.children}
      </Button>
    </div>
  );
}
