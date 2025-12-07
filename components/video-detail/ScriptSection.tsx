"use client";

import { useState } from "react";
import { Copy, Check, FileText, ChevronDown, ChevronUp, Loader2, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoStatus } from "@/lib/types";
import { approveScript, updateProjectScript } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ScriptSectionProps {
  script?: string;
  status: VideoStatus;
  scriptApproved: boolean;
  projectId: string;
  onCopySuccess: () => void;
  onApprovalChange: (approved: boolean) => void;
  onApprovalError: (error: string) => void;
  onScriptChange?: (script: string) => void;
  onScriptSaveSuccess?: () => void;
}

// Determine script status based on project status
const getScriptStatus = (status: string) => {
  const finishedStatuses = [
    "Ready for Voiceover",
    "Voiceover in progress",
    "Voiceover done",
    "Images generating",
    "Video assembly",
    "Video Assembly in progress",
    "Video Assembly done",
    "Thumbnail creation",
    "Upload pending",
    "Published",
  ];

  if (finishedStatuses.includes(status)) {
    return { label: "Finished", color: "green" };
  }
  return { label: "Pending", color: "yellow" };
};

export function ScriptSection({
  script,
  status,
  scriptApproved,
  projectId,
  onCopySuccess,
  onApprovalChange,
  onApprovalError,
  onScriptChange,
  onScriptSaveSuccess,
}: ScriptSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedScript, setEditedScript] = useState(script || "");
  const [isSaving, setIsSaving] = useState(false);
  const hasScript = script && script.length > 0;
  const scriptStatus = getScriptStatus(status);

  const handleCopy = async () => {
    if (!script) return;

    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy script:", err);
    }
  };

  const handleApprovalChange = async () => {
    if (isUpdatingApproval) return;

    setIsUpdatingApproval(true);
    const newApproved = !scriptApproved;

    const result = await approveScript(projectId, newApproved);

    if (result.success) {
      onApprovalChange(newApproved);
    } else {
      onApprovalError(result.error || "Failed to update script approval");
    }

    setIsUpdatingApproval(false);
  };

  const handleEditClick = () => {
    setEditedScript(script || "");
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedScript(script || "");
    setIsEditMode(false);
  };

  const handleSaveScript = async () => {
    if (isSaving) return;

    setIsSaving(true);
    const result = await updateProjectScript(projectId, editedScript);

    if (result.success) {
      if (onScriptChange) {
        onScriptChange(editedScript);
      }
      if (onScriptSaveSuccess) {
        onScriptSaveSuccess();
      }
      setIsEditMode(false);
    } else {
      onApprovalError(result.error || "Failed to save script");
    }

    setIsSaving(false);
  };

  // Check if script is long enough to need collapsing
  const isLongScript = hasScript && script.length > 1000;
  const displayScript =
    isLongScript && !isExpanded ? script.slice(0, 1000) + "..." : script;

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
          ) : scriptStatus.color === "green" ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400">
              {scriptStatus.label}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-400">
              {scriptStatus.label}
            </span>
          )}
        </div>

        {hasScript && !isEditMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        )}
      </div>

      {hasScript || isEditMode ? (
        <div className="space-y-4">
          {isEditMode ? (
            /* Edit Mode */
            <div className="space-y-4">
              <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="w-full min-h-[300px] rounded-md bg-zinc-950/50 p-4 text-sm leading-relaxed text-gray-300 border border-zinc-700 focus:border-cyan-500 focus:outline-none resize-y"
                placeholder="Enter script content..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveScript}
                  disabled={isSaving}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <div
                className={cn(
                  "relative overflow-hidden rounded-md bg-zinc-950/50 p-4",
                  !isExpanded && isLongScript && "max-h-64"
                )}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                  {displayScript}
                </pre>
                {!isExpanded && isLongScript && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                )}
              </div>

              {isLongScript && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full gap-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Full Script
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {/* Script Approval Checkbox - always show when script exists */}
          {!isEditMode && (
            <div className="border-t border-zinc-800/50 pt-4 mt-4">
              <label
                className={cn(
                  "flex items-center gap-3 cursor-pointer select-none",
                  isUpdatingApproval && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={scriptApproved}
                    onChange={handleApprovalChange}
                    disabled={isUpdatingApproval}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "h-5 w-5 rounded border-2 transition-colors flex items-center justify-center",
                      scriptApproved
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-transparent border-zinc-600 hover:border-zinc-500"
                    )}
                  >
                    {isUpdatingApproval ? (
                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                    ) : scriptApproved ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm",
                    scriptApproved ? "text-emerald-400" : "text-gray-400"
                  )}
                >
                  Script approved and ready for video generation
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-8">
                Approve the script to enable video generation
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-950/30 py-12 text-center">
          <div className="mb-3 rounded-full bg-zinc-800/50 p-3">
            <FileText className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">
            {status === "Failed"
              ? "Script generation failed"
              : "Script will appear here once generated"}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Current status: {status}
          </p>
        </div>
      )}
    </div>
  );
}
