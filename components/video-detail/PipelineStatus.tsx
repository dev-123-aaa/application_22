"use client";

import { Check, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoStatus, PIPELINE_STAGES, PIPELINE_STAGE_CONFIG } from "@/lib/types";

interface PipelineStatusProps {
  status: VideoStatus;
  videoStatus?: string | null;
}

// Video Generation sub-statuses for display
const VIDEO_GEN_STATUSES = ["Section Chunking", "Rendering", "Finalizing", "Video Finished"];

// Get stage status based on main status and video status
function getStageState(
  stageKey: string,
  mainStatus: VideoStatus,
  videoStatus: string | null
): "completed" | "current" | "pending" | "failed" {
  const isFailed = mainStatus === "Failed";
  if (isFailed) return stageKey === "outline" ? "failed" : "pending";

  // Special handling for Video Generation stage
  if (stageKey === "video-generation") {
    if (!videoStatus) return "pending";
    if (videoStatus === "Video Finished") return "completed";
    if (videoStatus === "Video Failed") return "failed";
    if (VIDEO_GEN_STATUSES.includes(videoStatus)) return "current";
    return "pending";
  }

  // For other stages, use the stage config to determine status
  const stageConfig = PIPELINE_STAGE_CONFIG.find(s => s.key === stageKey);
  if (!stageConfig) return "pending";

  // Get all non-video-generation statuses in order
  const allMainStatuses: string[] = [];
  PIPELINE_STAGE_CONFIG.forEach(config => {
    if (config.key !== "video-generation") {
      allMainStatuses.push(...config.statuses);
    }
  });

  const currentStatusIndex = allMainStatuses.indexOf(mainStatus);
  const stageStartIndex = allMainStatuses.indexOf(stageConfig.statuses[0]);
  const stageEndIndex = allMainStatuses.indexOf(stageConfig.statuses[stageConfig.statuses.length - 1]);

  // Status not found in main statuses (might be Failed or unknown)
  if (currentStatusIndex < 0) return "pending";

  // Past this stage
  if (currentStatusIndex > stageEndIndex) return "completed";

  // Currently in this stage
  if (currentStatusIndex >= stageStartIndex && currentStatusIndex <= stageEndIndex) {
    // Check if it's a "done" status within the stage
    const doneStatuses = ["Outline done", "Sections done", "Ready for Voiceover", "Voiceover done"];
    if (doneStatuses.includes(mainStatus) && currentStatusIndex === stageEndIndex) {
      return "completed";
    }
    return "current";
  }

  return "pending";
}

export function PipelineStatus({ status, videoStatus }: PipelineStatusProps) {
  // Build stage display info
  const stages = PIPELINE_STAGES.map((stage, index) => {
    const stageConfig = PIPELINE_STAGE_CONFIG[index];
    const stageKey = stageConfig?.key || stage.toLowerCase().replace(" ", "-");
    const state = getStageState(stageKey, status, videoStatus || null);

    // For Video Generation stage, show the sub-status
    let displayLabel: string = stage;
    if (stageKey === "video-generation" && videoStatus && state === "current") {
      displayLabel = `${stage} (${videoStatus}...)`;
    }

    return {
      key: stageKey,
      label: stage,
      displayLabel,
      state,
    };
  });

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      <h3 className="mb-6 text-xs font-light uppercase tracking-widest text-gray-400">
        Pipeline Status
      </h3>

      {/* Desktop: Horizontal stepper */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-zinc-800" />

          <div className="relative flex justify-between">
            {stages.map((stage) => {
              const isComplete = stage.state === "completed";
              const isCurrent = stage.state === "current";
              const isPending = stage.state === "pending";
              const isStgFailed = stage.state === "failed";

              return (
                <div
                  key={stage.key}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / stages.length}%` }}
                >
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                      isComplete && "border-emerald-500 bg-emerald-500/20 text-emerald-400",
                      isCurrent && "border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20",
                      isPending && "border-zinc-700 bg-zinc-900 text-zinc-600",
                      isStgFailed && "border-red-500 bg-red-500/20 text-red-400"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : isStgFailed ? (
                      <X className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Circle className="h-3 w-3 fill-current" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-center text-[10px] leading-tight",
                      isComplete && "text-emerald-400",
                      isCurrent && "font-medium text-cyan-400",
                      isPending && "text-zinc-600",
                      isStgFailed && "text-red-400"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Vertical stepper */}
      <div className="lg:hidden">
        <div className="relative">
          {stages.map((stage, index) => {
            const isComplete = stage.state === "completed";
            const isCurrent = stage.state === "current";
            const isPending = stage.state === "pending";
            const isStgFailed = stage.state === "failed";
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.key} className="relative flex items-start pb-6">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 h-full w-0.5 -translate-x-1/2",
                      isComplete ? "bg-emerald-500/50" : "bg-zinc-800"
                    )}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isComplete && "border-emerald-500 bg-emerald-500/20 text-emerald-400",
                    isCurrent && "border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20",
                    isPending && "border-zinc-700 bg-zinc-900 text-zinc-600",
                    isStgFailed && "border-red-500 bg-red-500/20 text-red-400"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : isStgFailed ? (
                    <X className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Circle className="h-3 w-3 fill-current" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "ml-3 pt-1 text-sm",
                    isComplete && "text-emerald-400",
                    isCurrent && "font-medium text-cyan-400",
                    isPending && "text-zinc-600",
                    isStgFailed && "text-red-400"
                  )}
                >
                  {stage.displayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
