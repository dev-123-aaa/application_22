"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "loading" | "saving" | "success" | "error";

export function WebhookSettings() {
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
        if (response.status === 404) {
          // No webhook configured yet - that's okay
          setStatus("idle");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch settings");
      }

      const data = await response.json();
      console.log("Fetched settings:", data);
      setWebhookUrl(data.webhook_url);
      setOriginalUrl(data.webhook_url);
      setLastUpdated(data.updated_at);
      setStatus("idle");
    } catch (err) {
      console.error("Fetch settings error:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
      setStatus("error");
    }
  };

  const handleSave = async () => {
    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      const payload = { key: "webhook_url", value: webhookUrl };
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

      setWebhookUrl(data.webhook_url);
      setOriginalUrl(data.webhook_url);
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
          <h2 className="text-lg font-medium text-white">Webhook Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure the webhook URL for video production triggers
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
          <Label htmlFor="webhook-url" className="text-gray-300">
            Webhook URL
          </Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://your-webhook-endpoint.com/trigger"
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
      <div className="mt-6 rounded-md border border-cyan-500/20 bg-cyan-500/5 p-4">
        <p className="text-sm text-cyan-400">
          This webhook is called when a new video is created from the dashboard.
          It triggers the automated video production pipeline.
        </p>
      </div>
    </div>
  );
}
