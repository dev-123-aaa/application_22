"use client";

import { useState } from "react";
import { FileText, ExternalLink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoStatus, ScriptStatus } from "@/lib/types";
import { updateScriptStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ScriptSectionProps {
  scriptUrl?: string;
  status: VideoStatus;
  scriptStatus: ScriptStatus;
  projectId: string;
  onStatusChange: (status: ScriptStatus) => void;
  onStatusError: (error: string) => void;
}

// Determine script status label and color
const getScriptStatusDisplay = (scriptStatus: ScriptStatus) => {
  switch (scriptStatus) {
    case "approved":
      return { label: "Approved", color: "green" };
    case "draft":
      return { label: "Draft", color: "yellow" };
    case "pending":
    default:
      return { label: "Pending", color: "gray" };
  }
};

export function ScriptSection({
  scriptUrl,
  status,
  scriptStatus,
  projectId,
  onStatusChange,
  onStatusError,
}: ScriptSectionProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const hasScriptUrl = scriptUrl && scriptUrl.length > 0;
  const statusDisplay = getScriptStatusDisplay(scriptStatus);
  const isApproved = scriptStatus === "approved";

  const handleStatusChange = async (newStatus: ScriptStatus) => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);

    const result = await updateScriptStatus(projectId, newStatus);

    if (result.success) {
      onStatusChange(newStatus);
    } else {
      onStatusError(result.error || "Failed to update script status");
    }

    setIsUpdatingStatus(false);
  };

  const handleApprovalToggle = () => {
    const newStatus = isApproved ? "draft" : "approved";
    handleStatusChange(newStatus);
  };

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-light uppercase tracking-widest text-gray-400">
            Script
          </h3>
          {status === "Failed" ? (
            <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs text-red-400">
              Failed
            </span>
          ) : statusDisplay.color === "green" ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400">
              {statusDisplay.label}
            </span>
          ) : statusDisplay.color === "yellow" ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-400">
              {statusDisplay.label}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-500/10 border border-zinc-500/30 px-2 py-0.5 text-xs text-zinc-400">
              {statusDisplay.label}
            </span>
          )}
        </div>
      </div>

      {hasScriptUrl ? (
        <div className="space-y-4">
          {/* Google Doc Link */}
          <div className="rounded-md bg-zinc-950/50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Google Doc Script</p>
                <p className="text-xs text-gray-500 truncate">{scriptUrl}</p>
              </div>
              <a
                href={scriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Script
              </a>
            </div>
          </div>

          {/* Script Approval Checkbox */}
          <div className="border-t border-zinc-800/50 pt-4 mt-4">
            <label
              className={cn(
                "flex items-center gap-3 cursor-pointer select-none",
                isUpdatingStatus && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isApproved}
                  onChange={handleApprovalToggle}
                  disabled={isUpdatingStatus}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "h-5 w-5 rounded border-2 transition-colors flex items-center justify-center",
                    isApproved
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-transparent border-zinc-600 hover:border-zinc-500"
                  )}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  ) : isApproved ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : null}
                </div>
              </div>
              <span
                className={cn(
                  "text-sm",
                  isApproved ? "text-emerald-400" : "text-gray-400"
                )}
              >
                Script approved and ready for video generation
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              Review the script in Google Docs and approve to enable video generation
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-950/30 py-12 text-center">
          <div className="mb-3 rounded-full bg-zinc-800/50 p-3">
            <FileText className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            {status === "Failed"
              ? "Script generation failed"
              : "Script link will appear here once generated"}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Current status: {status}
          </p>
        </div>
      )}
    </div>
  );
}
