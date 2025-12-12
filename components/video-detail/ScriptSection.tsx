"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Loader2, Check, Clock, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoStatus, ScriptStatus } from "@/lib/types";
import { updateScriptStatus, updateScriptUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ScriptSectionProps {
  scriptUrl?: string;
  status: VideoStatus;
  scriptStatus: ScriptStatus;
  projectId: string;
  onStatusChange: (status: ScriptStatus) => void;
  onStatusError: (error: string) => void;
  onUrlChange?: (url: string) => void;
}

// Validate Google Docs URL format
function isValidGoogleDocsUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "docs.google.com") return false;
    const pathMatch = parsed.pathname.match(/^\/document\/d\/[a-zA-Z0-9_-]+/);
    return pathMatch !== null;
  } catch {
    return false;
  }
}

// Determine script status display
const getScriptStatusDisplay = (scriptStatus: ScriptStatus) => {
  switch (scriptStatus) {
    case "approved":
      return { label: "Approved", color: "green", icon: Check };
    case "draft":
      return { label: "Draft", color: "yellow", icon: FileText };
    case "pending":
    default:
      return { label: "Pending", color: "gray", icon: Clock };
  }
};

export function ScriptSection({
  scriptUrl,
  status,
  scriptStatus,
  projectId,
  onStatusChange,
  onStatusError,
  onUrlChange,
}: ScriptSectionProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(scriptUrl || "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const hasScriptUrl = scriptUrl && scriptUrl.length > 0;
  const statusDisplay = getScriptStatusDisplay(scriptStatus);
  const isApproved = scriptStatus === "approved";
  const canEdit = !isApproved && status !== "Failed";
  const StatusIcon = statusDisplay.icon;

  // Sync urlInput with prop changes
  useEffect(() => {
    setUrlInput(scriptUrl || "");
    setHasUnsavedChanges(false);
  }, [scriptUrl]);

  const handleUrlInputChange = (value: string) => {
    setUrlInput(value);
    setUrlError(null);
    setHasUnsavedChanges(value !== (scriptUrl || ""));
  };

  const handleSaveUrl = async () => {
    if (!urlInput.trim()) {
      setUrlError("URL is required");
      return;
    }

    if (!isValidGoogleDocsUrl(urlInput)) {
      setUrlError("Please enter a valid Google Docs URL (https://docs.google.com/document/d/...)");
      return;
    }

    setIsUpdatingUrl(true);
    setUrlError(null);

    const result = await updateScriptUrl(projectId, urlInput);

    if (result.success) {
      setHasUnsavedChanges(false);
      if (onUrlChange) {
        onUrlChange(urlInput);
      }
      // Auto-set to draft if currently pending
      if (scriptStatus === "pending") {
        handleStatusChange("draft");
      }
    } else {
      setUrlError(result.error || "Failed to save URL");
    }

    setIsUpdatingUrl(false);
  };

  const handleStatusChange = async (newStatus: ScriptStatus) => {
    if (isUpdatingStatus) return;

    // Validate URL before approving
    if (newStatus === "approved") {
      if (!urlInput.trim() || !isValidGoogleDocsUrl(urlInput)) {
        onStatusError("Cannot approve: Please ensure a valid Google Docs URL is saved first");
        return;
      }
    }

    setIsUpdatingStatus(true);

    const result = await updateScriptStatus(projectId, newStatus);

    if (result.success) {
      onStatusChange(newStatus);
    } else {
      onStatusError(result.error || "Failed to update script status");
    }

    setIsUpdatingStatus(false);
  };

  const handleApprove = () => {
    handleStatusChange("approved");
  };

  const handleUnapprove = () => {
    handleStatusChange("draft");
  };

  // Render status badge
  const renderStatusBadge = () => {
    if (status === "Failed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      );
    }

    const badgeColors = {
      green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      yellow: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      gray: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
    };

    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
        badgeColors[statusDisplay.color as keyof typeof badgeColors]
      )}>
        <StatusIcon className="h-3 w-3" />
        {statusDisplay.label}
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-light uppercase tracking-widest text-gray-400">
            Script
          </h3>
          {renderStatusBadge()}
        </div>
      </div>

      {/* Content */}
      {status === "Failed" ? (
        // Failed state
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-red-800/50 bg-red-950/20 py-12 text-center">
          <div className="mb-3 rounded-full bg-red-500/10 p-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-sm text-red-400">Script generation failed</p>
          <p className="mt-1 text-xs text-gray-600">
            Please try creating a new project
          </p>
        </div>
      ) : !hasScriptUrl && scriptStatus === "pending" ? (
        // Waiting for script state
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-950/30 py-12 text-center">
          <div className="mb-3 rounded-full bg-cyan-500/10 p-3">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Waiting for script...</p>
          <p className="mt-1 text-xs text-gray-600">
            The script will appear here once n8n generates the Google Doc
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Current pipeline status: {status}
          </p>
        </div>
      ) : (
        // URL present or editable state
        <div className="space-y-4">
          {/* URL Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Google Doc URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  disabled={!canEdit || isUpdatingUrl}
                  placeholder="https://docs.google.com/document/d/..."
                  className={cn(
                    "w-full rounded-md border bg-zinc-950/50 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors",
                    urlError
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : "border-zinc-700 focus:ring-cyan-500/30 focus:border-cyan-500/50",
                    !canEdit && "opacity-60 cursor-not-allowed bg-zinc-900/50"
                  )}
                />
                {urlError && (
                  <p className="absolute -bottom-5 left-0 text-xs text-red-400">
                    {urlError}
                  </p>
                )}
              </div>
              {canEdit && hasUnsavedChanges && (
                <Button
                  onClick={handleSaveUrl}
                  disabled={isUpdatingUrl || !urlInput.trim()}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-500"
                >
                  {isUpdatingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              )}
            </div>
            {urlError && <div className="h-4" />}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Open Google Doc Button */}
            {urlInput && isValidGoogleDocsUrl(urlInput) && (
              <a
                href={urlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Open Google Doc
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}

            {/* Approve/Unapprove Button */}
            {isApproved ? (
              <Button
                onClick={handleUnapprove}
                disabled={isUpdatingStatus}
                variant="outline"
                className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                Revoke Approval
              </Button>
            ) : (
              <Button
                onClick={handleApprove}
                disabled={isUpdatingStatus || !urlInput || !isValidGoogleDocsUrl(urlInput) || hasUnsavedChanges}
                className={cn(
                  "gap-2",
                  (!urlInput || !isValidGoogleDocsUrl(urlInput) || hasUnsavedChanges)
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                )}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve Script
              </Button>
            )}
          </div>

          {/* Help text */}
          <div className="pt-2 border-t border-zinc-800/50">
            {isApproved ? (
              <p className="text-xs text-emerald-400/70 flex items-center gap-2">
                <Check className="h-3 w-3" />
                Script approved — Video and thumbnail generation are now enabled
              </p>
            ) : hasUnsavedChanges ? (
              <p className="text-xs text-amber-400/70 flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                You have unsaved changes — Save the URL before approving
              </p>
            ) : urlInput && isValidGoogleDocsUrl(urlInput) ? (
              <p className="text-xs text-gray-500">
                Review the script in Google Docs and approve when ready for video generation
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Enter a valid Google Docs URL to enable script approval
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
