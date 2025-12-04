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
import { startProduction, fetchWebhookUrl } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";

interface FormData {
  title: string;
  hours: string;
  minutes: string;
}

interface FormErrors {
  title?: string;
  hours?: string;
  minutes?: string;
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
    duration_hours: project.duration_hours,
    duration_minutes: project.duration_minutes,
    main_characters: project.main_characters || "",
    primary_locations: project.primary_locations || "",
    central_theme: project.central_theme || "",
    tone: project.tone || "",
    script: project.script || undefined,
    thumbnail_suggestions: project.thumbnail_suggestions || undefined,
  };
}

export function NewVideoModal({ onSuccess, onError, onWarning }: NewVideoModalProps) {
  const { isModalOpen, closeModal, addVideo } = useVideos();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    hours: "0",
    minutes: "15",
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: "", hours: "0", minutes: "15" });
    setErrors({});
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
      // Prefetch webhook URL to give better error messages
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
              disabled={isSubmitting}
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
