"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/lib/contexts/VideoContext";
import { cn } from "@/lib/utils";

export function Header() {
  const { openModal } = useVideos();
  const pathname = usePathname();

  const isAnalyticsPage = pathname === "/analytics";
  const isDashboardPage = pathname === "/";
  const isSettingsPage = pathname === "/settings";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/">
            <h1 className="text-xl font-extralight tracking-wide text-white">
              <span className="text-cyan-400">Cartoonolgy</span> Studio
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-2 text-sm font-light transition-colors rounded-md",
                isDashboardPage
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className={cn(
                "px-3 py-2 text-sm font-light transition-colors rounded-md flex items-center gap-2",
                isAnalyticsPage
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              href="/settings"
              className={cn(
                "px-3 py-2 text-sm font-light transition-colors rounded-md flex items-center gap-2",
                isSettingsPage
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Navigation Icons */}
          <Link href="/analytics" className="sm:hidden">
            <Button
              variant={isAnalyticsPage ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                isAnalyticsPage && "text-cyan-400"
              )}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings" className="sm:hidden">
            <Button
              variant={isSettingsPage ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                isSettingsPage && "text-cyan-400"
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          <Button variant="outline" size="sm" className="gap-2" onClick={openModal}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Video</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
