"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddChannelModal } from "@/components/modals/AddChannelModal";
import { EditChannelModal } from "@/components/modals/EditChannelModal";
import { Toast } from "@/components/ui/toast";
import { Channel } from "@/lib/db/schema";

export function ChannelManagement() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchChannels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/channels?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch channels");
      }

      const data = await response.json();
      setChannels(data.channels || []);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleAddSuccess = async (channel: { channel_id: string; name: string }) => {
    await fetchChannels();
    setToast({ message: `Channel "${channel.name}" created successfully`, type: "success" });
  };

  const handleEditSuccess = async (channel: Channel) => {
    await fetchChannels();
    setToast({ message: `Channel "${channel.name}" updated successfully`, type: "success" });
  };

  const handleDeleteSuccess = async () => {
    await fetchChannels();
    setToast({ message: "Channel deleted successfully", type: "success" });
  };

  const handleError = (message: string) => {
    setToast({ message, type: "error" });
  };

  return (
    <div id="channels" className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 scroll-mt-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-light text-white">Channel Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your channels and their settings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-400">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={fetchChannels}
          >
            Try again
          </Button>
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-4">No channels yet</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create your first channel
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <div
              key={channel.channel_id}
              className="flex items-center gap-4 px-4 py-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
            >
              {/* Color dot */}
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: channel.color }}
              />

              {/* Channel info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {channel.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {channel.slug}
                  </span>
                </div>
                {channel.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {channel.description}
                  </p>
                )}
              </div>

              {/* Project count */}
              <div className="flex-shrink-0 text-right">
                <span className="text-xs text-gray-400">
                  {channel.project_count || 0} project
                  {(channel.project_count || 0) !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 p-0"
                onClick={() => setEditingChannel(channel)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit {channel.name}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Channel Modal */}
      <AddChannelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        onError={handleError}
      />

      {/* Edit Channel Modal */}
      <EditChannelModal
        isOpen={!!editingChannel}
        channel={editingChannel}
        onClose={() => setEditingChannel(null)}
        onSuccess={handleEditSuccess}
        onDelete={handleDeleteSuccess}
        onError={handleError}
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
