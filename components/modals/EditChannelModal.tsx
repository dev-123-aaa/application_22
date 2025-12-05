"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
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
import { isValidHexColor } from "@/lib/db/schema";
import { Channel } from "@/lib/db/schema";

interface EditChannelModalProps {
  isOpen: boolean;
  channel: Channel | null;
  onClose: () => void;
  onSuccess: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
  onError: (message: string) => void;
}

interface FormData {
  name: string;
  slug: string;
  color: string;
  description: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  color?: string;
}

export function EditChannelModal({
  isOpen,
  channel,
  onClose,
  onSuccess,
  onDelete,
  onError,
}: EditChannelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    color: "#00D4FF",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form when channel changes
  useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name,
        slug: channel.slug,
        color: channel.color,
        description: channel.description || "",
      });
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [channel]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must only contain lowercase letters, numbers, and hyphens";
    }

    if (!isValidHexColor(formData.color)) {
      newErrors.color = "Color must be a valid hex color (e.g., #FF0000)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !channel) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/channels/${channel.channel_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          color: formData.color,
          description: formData.description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update channel");
      }

      onSuccess(data.channel);
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to update channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!channel) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/channels/${channel.channel_id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete channel");
      }

      onDelete(channel.channel_id);
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete channel");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      onClose();
    }
  };

  const projectCount = channel?.project_count || 0;
  const canDelete = projectCount === 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
          <DialogDescription>
            Update channel settings or delete the channel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" error={!!errors.name}>
              Channel Name
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="e.g., Anime Explained"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSubmitting || isDeleting}
              error={!!errors.name}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Slug field */}
          <div className="space-y-2">
            <Label htmlFor="edit-slug" error={!!errors.slug}>
              Slug (URL identifier)
            </Label>
            <Input
              id="edit-slug"
              type="text"
              placeholder="anime-explained"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slug: e.target.value.toLowerCase(),
                }))
              }
              disabled={isSubmitting || isDeleting}
              error={!!errors.slug}
            />
            {errors.slug ? (
              <p className="text-xs text-red-400">{errors.slug}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Used in URLs and API calls
              </p>
            )}
          </div>

          {/* Color field */}
          <div className="space-y-2">
            <Label htmlFor="edit-color" error={!!errors.color}>
              Brand Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="edit-color"
                type="text"
                placeholder="#00D4FF"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    color: e.target.value.toUpperCase(),
                  }))
                }
                disabled={isSubmitting || isDeleting}
                error={!!errors.color}
                className="flex-1"
              />
              <span
                className="h-9 w-9 rounded-md border border-zinc-700 flex-shrink-0"
                style={{
                  backgroundColor: isValidHexColor(formData.color)
                    ? formData.color
                    : "#333",
                }}
              />
            </div>
            {errors.color && (
              <p className="text-xs text-red-400">{errors.color}</p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <textarea
              id="edit-description"
              placeholder="What kind of content does this channel produce?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting || isDeleting}
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Delete section */}
          <div className="border-t border-zinc-700/50 pt-6">
            {showDeleteConfirm ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      Delete {channel?.name}?
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, delete"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || !canDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Channel
                </Button>
                {!canDelete && (
                  <p className="text-xs text-gray-500 mt-2">
                    This channel has {projectCount} project{projectCount !== 1 ? "s" : ""}.
                    Delete or move all projects first to remove this channel.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
