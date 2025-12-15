"use client";

import { useState } from "react";
import { Mic, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateVoiceover } from "@/lib/api";
import { Video, VoiceoverStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VoiceoverSectionProps {
  video: Video;
  onUpdate: () => void;
}

/**
 * VoiceoverSection Component
 *
 * Displays voiceover generation controls and status.
 * Requires script to be approved before voiceover can be generated.
 *
 * States:
 * - Disabled: Script not approved
 * - Ready: Script approved, voiceover pending
 * - In Progress: Voiceover being generated
 * - Done: Voiceover complete
 */
export function VoiceoverSection({ video, onUpdate }: VoiceoverSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isScriptApproved = video.script_status === "approved";
  const voiceoverStatus: VoiceoverStatus = video.voiceover_status || "pending";

  const handleGenerateVoiceover = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateVoiceover(video.project_id);
      if (result.success) {
        onUpdate(); // Refresh video data
      } else {
        setError(result.error || "Failed to generate voiceover");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate voiceover");
    } finally {
      setIsGenerating(false);
    }
  };

  // Status badge styling
  const getStatusBadge = () => {
    switch (voiceoverStatus) {
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            In Progress
          </span>
        );
      case "done":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Done
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 border border-zinc-500/30 px-2.5 py-1 text-xs text-zinc-400">
            Pending
          </span>
        );
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = !isScriptApproved || isGenerating || voiceoverStatus === "in_progress";

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-light uppercase tracking-widest text-gray-400">
            Voiceover
          </h3>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Info message when script not approved */}
        {!isScriptApproved && (
          <div className="flex items-start gap-3 rounded-md border border-dashed border-amber-800/50 bg-amber-950/20 p-4">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-400">Script must be approved</p>
              <p className="mt-1 text-xs text-gray-500">
                Approve the script in the section above before generating voiceover.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 rounded-md border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success message when done */}
        {voiceoverStatus === "done" && (
          <div className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-400">Voiceover generation complete!</p>
              <p className="mt-1 text-xs text-gray-500">
                You can regenerate the voiceover if needed.
              </p>
            </div>
          </div>
        )}

        {/* In progress message */}
        {voiceoverStatus === "in_progress" && !isGenerating && (
          <div className="flex items-start gap-3 rounded-md border border-dashed border-blue-800/50 bg-blue-950/20 p-4">
            <Loader2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="text-sm text-blue-400">Voiceover is being generated...</p>
              <p className="mt-1 text-xs text-gray-500">
                This may take a few minutes. The status will update automatically.
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateVoiceover}
          disabled={isButtonDisabled}
          className={cn(
            "gap-2",
            isButtonDisabled
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-500 text-white"
          )}
        >
          {isGenerating || voiceoverStatus === "in_progress" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : voiceoverStatus === "done" ? (
            <>
              <Mic className="h-4 w-4" />
              Regenerate Voiceover
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Generate Voiceover
            </>
          )}
        </Button>

        {/* Help text */}
        {isScriptApproved && voiceoverStatus === "pending" && (
          <p className="text-xs text-gray-500 pt-2 border-t border-zinc-800/50">
            Click the button above to generate voiceover from the approved script.
          </p>
        )}
      </div>
    </div>
  );
}
