"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "loading" | "saving" | "success" | "error";

interface WebhookField {
  key: string;
  label: string;
  description: string;
}

const WEBHOOK_FIELDS: WebhookField[] = [
  {
    key: "webhook_script",
    label: "Script Generation Webhook",
    description: "Triggered when starting a new video project",
  },
  {
    key: "webhook_video",
    label: "Video Generation Webhook",
    description: "Triggered when generating video from approved script",
  },
  {
    key: "webhook_thumbnail",
    label: "Thumbnail Generation Webhook",
    description: "Triggered when generating thumbnails for a video",
  },
];

export function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<Record<string, string>>({
    webhook_script: "",
    webhook_video: "",
    webhook_thumbnail: "",
  });
  const [originalWebhooks, setOriginalWebhooks] = useState<Record<string, string>>({
    webhook_script: "",
    webhook_video: "",
    webhook_thumbnail: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch current settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setStatus("loading");
    setErrors({});

    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setStatus("idle");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch settings");
      }

      const data = await response.json();
      console.log("Fetched settings:", data);

      const newWebhooks = {
        webhook_script: data.webhook_script || "",
        webhook_video: data.webhook_video || "",
        webhook_thumbnail: data.webhook_thumbnail || "",
      };

      setWebhooks(newWebhooks);
      setOriginalWebhooks(newWebhooks);
      setLastUpdated(data.updated_at);
      setStatus("idle");
    } catch (err) {
      console.error("Fetch settings error:", err);
      setErrors({ general: err instanceof Error ? err.message : "Failed to load settings" });
      setStatus("error");
    }
  };

  const handleSave = async (key: string) => {
    const value = webhooks[key];

    // Validate URL format if value is provided
    if (value && value.length > 0) {
      try {
        new URL(value);
      } catch {
        setErrors((prev) => ({ ...prev, [key]: "Please enter a valid URL" }));
        return;
      }
    }

    setSavingKey(key);
    setErrors((prev) => ({ ...prev, [key]: null }));

    try {
      const payload = { key, value };
      console.log("Saving settings:", payload);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json();
      console.log("Save response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setOriginalWebhooks((prev) => ({ ...prev, [key]: value }));
      setLastUpdated(data.updated_at);
      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setSavingKey(null);
      }, 2000);
    } catch (err) {
      console.error("Save settings error:", err);
      setErrors((prev) => ({
        ...prev,
        [key]: err instanceof Error ? err.message : "Failed to save settings",
      }));
      setSavingKey(null);
    }
  };

  const hasChanges = (key: string) => webhooks[key] !== originalWebhooks[key];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-light text-white">Webhook Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure webhook URLs for your automation pipelines
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchSettings}
          disabled={status === "loading"}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {errors.general && (
        <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errors.general}
        </div>
      )}

      <div className="space-y-6">
        {WEBHOOK_FIELDS.map((field) => (
          <div key={field.key} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={field.key} className="text-gray-300">
                {field.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={field.key}
                  type="url"
                  placeholder="https://your-webhook-endpoint.com/trigger"
                  value={webhooks[field.key]}
                  onChange={(e) => {
                    setWebhooks((prev) => ({ ...prev, [field.key]: e.target.value }));
                    setErrors((prev) => ({ ...prev, [field.key]: null }));
                  }}
                  error={!!errors[field.key]}
                  disabled={status === "loading" || savingKey === field.key}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave(field.key)}
                  disabled={
                    !hasChanges(field.key) ||
                    status === "loading" ||
                    savingKey !== null
                  }
                  size="sm"
                  className="gap-1.5 min-w-[80px]"
                >
                  {savingKey === field.key ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="sr-only">Saving...</span>
                    </>
                  ) : savingKey === null && status === "success" && !hasChanges(field.key) ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span className="sr-only">Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              {errors[field.key] && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  {errors[field.key]}
                </p>
              )}
              <p className="text-xs text-gray-500">{field.description}</p>
            </div>
          </div>
        ))}
      </div>

      {lastUpdated && !errors.general && (
        <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-zinc-800/50">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
}
