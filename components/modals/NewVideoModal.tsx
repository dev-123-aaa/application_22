"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVideos } from "@/lib/contexts/VideoContext";
import { useChannel } from "@/components/channel/ChannelProvider";
import { startProduction, fetchWebhookUrl, createProject } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";

type ScriptMode = "generate" | "manual";

interface FormData {
  title: string;
  hours: string;
  minutes: string;
}

interface FormErrors {
  title?: string;
  hours?: string;
  minutes?: string;
  scriptUrl?: string;
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

interface NewVideoModalProps {
  onSuccess: (title: string) => void;
  onError: (message: string) => void;
  onWarning?: (message: string) => void;
}

// Convert database Project to Video type
function projectToVideo(project: Project): Video {
  return {
    project_id: project.project_id,
    title: project.title,
    status: project.status as Video["status"],
    created_at: project.created_at,
    total_sections: project.total_sections || 0,
    current_section: project.current_section || 0,
    duration_hours: project.duration_hours,
    duration_minutes: project.duration_minutes,
    main_characters: project.main_characters || "",
    primary_locations: project.primary_locations || "",
    central_theme: project.central_theme || "",
    tone: project.tone || "",
    script_url: project.script_url || undefined,
    script_status: project.script_status,
    voiceover_status: project.voiceover_status || "pending",
    thumbnail_suggestions: project.thumbnail_suggestions || undefined,
    video_status: project.video_status || null,
    video_drive_folder: project.video_drive_folder || null,
  };
}

export function NewVideoModal({ onSuccess, onError, onWarning }: NewVideoModalProps) {
  const { isModalOpen, closeModal, addVideo } = useVideos();
  const { selectedChannel } = useChannel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    hours: "0",
    minutes: "15",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [scriptMode, setScriptMode] = useState<ScriptMode>("generate");
  const [manualScriptUrl, setManualScriptUrl] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    const hours = parseInt(formData.hours, 10);
    if (isNaN(hours) || hours < 0 || hours > 10) {
      newErrors.hours = "Hours must be between 0 and 10";
    }

    const minutes = parseInt(formData.minutes, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
      newErrors.minutes = "Minutes must be between 0 and 59";
    }

    // Validate manual script URL if in manual mode
    if (scriptMode === "manual") {
      if (!manualScriptUrl.trim()) {
        newErrors.scriptUrl = "Script URL is required in manual mode";
      } else if (!isValidGoogleDocsUrl(manualScriptUrl)) {
        newErrors.scriptUrl = "Please enter a valid Google Docs URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: "", hours: "0", minutes: "15" });
    setErrors({});
    setScriptMode("generate");
    setManualScriptUrl("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      closeModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const hours = parseInt(formData.hours, 10);
    const minutes = parseInt(formData.minutes, 10);

    try {
      if (scriptMode === "manual") {
        // Manual mode: Create project with script_url, don't trigger webhook
        const result = await createProject({
          title: formData.title.trim(),
          duration_hours: hours,
          duration_minutes: minutes,
          channel_id: selectedChannel?.channel_id,
          channel_name: selectedChannel?.name,
          script_mode: "manual",
          script_url: manualScriptUrl.trim(),
        });

        if (result.success && result.project) {
          const newVideo = projectToVideo(result.project);
          addVideo(newVideo);
          onSuccess(formData.title.trim());
          resetForm();
          closeModal();
        } else {
          onError(result.error || "Failed to create project. Please try again.");
        }
      } else {
        // Generate mode: Current behavior with webhook trigger
        const webhookUrl = await fetchWebhookUrl();

        if (!webhookUrl) {
          // Warn user but allow them to proceed
          const proceed = window.confirm(
            "Webhook URL is not configured. The project will be saved but the production pipeline won't be triggered.\n\nDo you want to continue?"
          );
          if (!proceed) {
            setIsSubmitting(false);
            return;
          }
        }

        const result = await startProduction({
          title: formData.title.trim(),
          duration_hours: hours,
          duration_minutes: minutes,
          channel_id: selectedChannel?.channel_id,
          channel_name: selectedChannel?.name,
        });

        if (result.success && result.project) {
          // Convert project to video and add to state
          const newVideo = projectToVideo(result.project);
          addVideo(newVideo);

          if (result.webhookFailed) {
            // Project saved but webhook failed
            if (onWarning) {
              onWarning(result.error || "Project saved but webhook trigger failed");
            } else {
              onError(result.error || "Project saved but webhook trigger failed");
            }
          } else {
            onSuccess(formData.title.trim());
          }

          resetForm();
          closeModal();
        } else {
          onError(result.error || "Failed to start production. Please try again.");
        }
      }
    } catch {
      onError("Failed to start production. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Start New Production</DialogTitle>
          <DialogDescription>
            Create a new video project and start the production pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Channel field (read-only) */}
          <div className="space-y-2">
            <Label>Channel</Label>
            {selectedChannel ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedChannel.color }}
                />
                <span className="text-sm font-light text-white">
                  {selectedChannel.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30">
                <span className="text-sm text-red-400">
                  No channel selected
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {selectedChannel
                ? "Creating video for this channel"
                : "Switch channels in the header to select a channel first"
              }
            </p>
          </div>

          {/* Script Source Toggle */}
          <div className="space-y-2">
            <Label>Script Source</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scriptMode"
                  value="generate"
                  checked={scriptMode === "generate"}
                  onChange={() => {
                    setScriptMode("generate");
                    setManualScriptUrl("");
                    setErrors((prev) => ({ ...prev, scriptUrl: undefined }));
                  }}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 focus:ring-cyan-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm text-gray-300">Generate Script</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scriptMode"
                  value="manual"
                  checked={scriptMode === "manual"}
                  onChange={() => setScriptMode("manual")}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-600 focus:ring-cyan-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm text-gray-300">Manual (paste URL)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {scriptMode === "generate"
                ? "Script will be auto-generated via n8n webhook"
                : "Paste an existing Google Doc URL for the script"
              }
            </p>
          </div>

          {/* Manual Script URL Input (shown when manual mode selected) */}
          {scriptMode === "manual" && (
            <div className="space-y-2">
              <Label htmlFor="scriptUrl" error={!!errors.scriptUrl}>
                Google Doc Script URL
              </Label>
              <Input
                id="scriptUrl"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={manualScriptUrl}
                onChange={(e) => {
                  setManualScriptUrl(e.target.value);
                  if (e.target.value && !isValidGoogleDocsUrl(e.target.value)) {
                    setErrors((prev) => ({ ...prev, scriptUrl: "Please enter a valid Google Docs URL" }));
                  } else {
                    setErrors((prev) => ({ ...prev, scriptUrl: undefined }));
                  }
                }}
                disabled={isSubmitting}
                error={!!errors.scriptUrl}
              />
              {errors.scriptUrl && (
                <p className="text-xs text-red-400">{errors.scriptUrl}</p>
              )}
            </div>
          )}

          {/* Title field */}
          <div className="space-y-2">
            <Label htmlFor="title" error={!!errors.title}>
              Video Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Why Squidward Is The Real Hero"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isSubmitting}
              error={!!errors.title}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Duration fields */}
          <div className="space-y-2">
            <Label error={!!errors.hours || !!errors.minutes}>
              Estimated Duration
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, hours: e.target.value }))
                    }
                    disabled={isSubmitting}
                    error={!!errors.hours}
                    className="text-center"
                  />
                  <span className="text-sm text-gray-500">hours</span>
                </div>
                {errors.hours && (
                  <p className="text-xs text-red-400">{errors.hours}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minutes: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                    error={!!errors.minutes}
                    className="text-center"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
                {errors.minutes && (
                  <p className="text-xs text-red-400">{errors.minutes}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">Estimated video length</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedChannel}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Production"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
