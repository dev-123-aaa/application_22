import { Settings } from "lucide-react";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
import { ThumbnailWebhookSettings } from "@/components/settings/ThumbnailWebhookSettings";
import { ChannelManagement } from "@/components/settings/ChannelManagement";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
            <Settings className="h-5 w-5 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-light text-white">Settings</h1>
        </div>
        <p className="text-gray-400 font-light">
          Configure your Cartoonolgy Studio preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <ChannelManagement />
        <WebhookSettings />
        <ThumbnailWebhookSettings />
      </div>
    </div>
  );
}
