"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Channel } from "@/lib/db/schema";

const STORAGE_KEY = "cartoonolgy-studio-selected-channel";

type ChannelContextType = {
  channels: Channel[];
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel) => void;
  isLoading: boolean;
  error: string | null;
  refetchChannels: () => Promise<void>;
};

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

interface ChannelProviderProps {
  children: ReactNode;
}

export function ChannelProvider({ children }: ChannelProviderProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannelState] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
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
      const fetchedChannels: Channel[] = data.channels || [];
      setChannels(fetchedChannels);

      // Get saved channel from localStorage
      const savedChannelId =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;

      if (savedChannelId && fetchedChannels.length > 0) {
        // Try to find the saved channel
        const savedChannel = fetchedChannels.find(
          (c) => c.channel_id === savedChannelId
        );
        if (savedChannel) {
          setSelectedChannelState(savedChannel);
        } else {
          // Saved channel no longer exists, use first one
          setSelectedChannelState(fetchedChannels[0]);
          localStorage.setItem(STORAGE_KEY, fetchedChannels[0].channel_id);
        }
      } else if (fetchedChannels.length > 0) {
        // No saved channel, use first one
        setSelectedChannelState(fetchedChannels[0]);
        localStorage.setItem(STORAGE_KEY, fetchedChannels[0].channel_id);
      }
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channels");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const setSelectedChannel = useCallback((channel: Channel) => {
    setSelectedChannelState(channel);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, channel.channel_id);
    }
  }, []);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        selectedChannel,
        setSelectedChannel,
        isLoading,
        error,
        refetchChannels: fetchChannels,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}
