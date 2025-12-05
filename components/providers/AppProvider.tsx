"use client";

import { ReactNode, useState } from "react";
import { VideoProvider } from "@/lib/contexts/VideoContext";
import { ChannelProvider } from "@/components/channel/ChannelProvider";
import { Header } from "@/components/layout/Header";
import { NewVideoModal } from "@/components/modals/NewVideoModal";
import { Toast } from "@/components/ui/toast";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ChannelProvider>
      <VideoProvider>
        <Header />
        {children}
        <NewVideoModal
          onSuccess={(title) =>
            showToast(`Production started for "${title}"`, "success")
          }
          onError={(message) => showToast(message, "error")}
        />
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={hideToast} />
        )}
      </VideoProvider>
    </ChannelProvider>
  );
}
