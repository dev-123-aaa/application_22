"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "loading" | "saving" | "success" | "error";

export function ThumbnailWebhookSettings() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch current settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setStatus("loading");
    setError(null);

    try {
      // Add cache-busting query param to prevent stale data
      const response = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch settings");
      }

      const data = await response.json();
      console.log("Fetched thumbnail webhook settings:", data);
      setWebhookUrl(data.thumbnail_webhook_url || "");
      setOriginalUrl(data.thumbnail_webhook_url || "");
      if (data.updated_at) {
        setLastUpdated(data.updated_at);
      }
      setStatus("idle");
    } catch (err) {
      console.error("Fetch settings error:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
      setStatus("error");
    }
  };

  const handleSave = async () => {
    // Validate URL format if not empty
    if (webhookUrl && webhookUrl.length > 0) {
      try {
        new URL(webhookUrl);
      } catch {
        setError("Please enter a valid URL");
        return;
      }
    }

    setStatus("saving");
    setError(null);

    try {
      const payload = { key: "thumbnail_webhook_url", value: webhookUrl };
      console.log("Saving thumbnail webhook settings:", payload);

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

      setWebhookUrl(data.thumbnail_webhook_url || "");
      setOriginalUrl(data.thumbnail_webhook_url || "");
      setLastUpdated(data.updated_at);
      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Save settings error:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
      setStatus("error");
    }
  };

  const hasChanges = webhookUrl !== originalUrl;

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
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-medium text-white">Thumbnail Automation Webhook</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Configure the webhook URL for thumbnail generation triggers
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchSettings}
          disabled={status === "loading" || status === "saving"}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thumbnail-webhook-url" className="text-gray-300">
            Thumbnail Webhook URL
          </Label>
          <Input
            id="thumbnail-webhook-url"
            type="url"
            placeholder="https://your-webhook-endpoint.com/thumbnail"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value);
              setError(null);
            }}
            error={!!error}
            disabled={status === "loading" || status === "saving"}
          />
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          {lastUpdated && !error && (
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || status === "loading" || status === "saving"}
            className="gap-2"
          >
            {status === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>

          {hasChanges && status !== "saving" && (
            <Button
              variant="ghost"
              onClick={() => {
                setWebhookUrl(originalUrl);
                setError(null);
              }}
              className="text-gray-400"
            >
              Discard
            </Button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-md border border-purple-500/20 bg-purple-500/5 p-4">
        <p className="text-sm text-purple-400">
          This webhook is called when you click &quot;Generate Thumbnail&quot; on a video detail page.
          It triggers the thumbnail generation automation with the project_id.
        </p>
      </div>
    </div>
  );
}
