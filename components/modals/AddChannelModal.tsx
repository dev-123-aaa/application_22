"use client";

import { useState, useEffect } from "react";
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
import { generateSlug, isValidHexColor } from "@/lib/db/schema";

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (channel: { channel_id: string; name: string }) => void;
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

export function AddChannelModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddChannelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    color: "#00D4FF",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        slug: "",
        color: "#00D4FF",
        description: "",
      });
      setErrors({});
      setSlugManuallyEdited(false);
    }
  }, [isOpen]);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    if (!slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(name) }));
    }
  };

  const handleSlugChange = (slug: string) => {
    setFormData((prev) => ({ ...prev, slug }));
    setSlugManuallyEdited(true);
  };

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

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
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
        throw new Error(data.error || "Failed to create channel");
      }

      onSuccess(data.channel);
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to create channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle>Add New Channel</DialogTitle>
          <DialogDescription>
            Create a new channel to organize your video projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name" error={!!errors.name}>
              Channel Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Anime Explained"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isSubmitting}
              error={!!errors.name}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Slug field */}
          <div className="space-y-2">
            <Label htmlFor="slug" error={!!errors.slug}>
              Slug (URL identifier)
            </Label>
            <Input
              id="slug"
              type="text"
              placeholder="anime-explained"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value.toLowerCase())}
              disabled={isSubmitting}
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
            <Label htmlFor="color" error={!!errors.color}>
              Brand Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="text"
                placeholder="#00D4FF"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value.toUpperCase() }))
                }
                disabled={isSubmitting}
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
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              placeholder="What kind of content does this channel produce?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
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
                  Creating...
                </>
              ) : (
                "Create Channel"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
