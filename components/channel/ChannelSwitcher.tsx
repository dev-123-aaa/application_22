"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Loader2, AlertCircle, Plus, Settings } from "lucide-react";
import { useChannel } from "./ChannelProvider";
import { AddChannelModal } from "@/components/modals/AddChannelModal";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function ChannelDot({ color, size = "sm" }: { color: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function ChannelSwitcher() {
  const router = useRouter();
  const { channels, selectedChannel, setSelectedChannel, isLoading, error, refetchChannels } =
    useChannel();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/50 min-w-[140px]">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30 min-w-[140px]">
        <AlertCircle className="h-3 w-3 text-red-400" />
        <span className="text-sm text-red-400">Error</span>
      </div>
    );
  }

  // No channels state
  if (channels.length === 0 || !selectedChannel) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/50 min-w-[140px]">
        <span className="text-sm text-gray-400">No channels</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all",
          "bg-zinc-800/50 border border-zinc-700/50",
          "hover:bg-zinc-800 hover:border-zinc-600",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/40",
          "min-w-[160px]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current channel: ${selectedChannel.name}`}
      >
        <ChannelDot color={selectedChannel.color} size="md" />
        <span className="text-sm font-light text-white flex-1 text-left truncate">
          {selectedChannel.name}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full mt-1 z-50",
            "min-w-[200px] py-1",
            "rounded-md border border-zinc-700/50",
            "bg-zinc-900/95 backdrop-blur-sm",
            "shadow-lg shadow-black/20"
          )}
          role="listbox"
          aria-label="Select channel"
        >
          {channels.map((channel) => {
            const isSelected = channel.channel_id === selectedChannel.channel_id;
            return (
              <button
                key={channel.channel_id}
                onClick={() => {
                  setSelectedChannel(channel);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                  "hover:bg-zinc-800",
                  isSelected && "bg-zinc-800/50"
                )}
                role="option"
                aria-selected={isSelected}
              >
                <ChannelDot color={channel.color} size="md" />
                <span
                  className={cn(
                    "text-sm font-light flex-1",
                    isSelected ? "text-white" : "text-gray-300"
                  )}
                >
                  {channel.name}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-cyan-400" />
                )}
              </button>
            );
          })}

          {/* Add Channel and Manage options */}
          <div className="border-t border-zinc-700/50 mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-light">Add Channel</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings#channels");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-light">Manage Channels</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      <AddChannelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async (channel) => {
          await refetchChannels();
          // Find and select the new channel from the refreshed list
          const response = await fetch(`/api/channels/${channel.channel_id}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedChannel(data.channel);
          }
          setToast({ message: `Channel "${channel.name}" created successfully`, type: "success" });
        }}
        onError={(message) => {
          setToast({ message, type: "error" });
        }}
      />

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
