"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { VideoList } from "@/components/dashboard/VideoList";
import { useVideos } from "@/lib/contexts/VideoContext";
import { useChannel } from "@/components/channel/ChannelProvider";
import { fetchProjects } from "@/lib/api";
import { Video } from "@/lib/types";
import { Project } from "@/lib/db/schema";
import { 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Clock,
  Filter,
  Grid3x3,
  List,
  Plus,
  Search,
  BarChart3,
  Users,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const POLL_INTERVAL = 10000; // 10 seconds
const DEBOUNCE_DELAY = 500; // Debounce delay

// Debounce utility function
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Convert database Project to Video type
function projectToVideo(project: Project): Video {
  return {
    project_id: project.project_id,
    title: project.title,
    status: project.status as Video["status"],
    created_at: project.created_at,
    total_sections: project.total_sections || 0,
    current_section: project.current_section || 0,
    duration_hours: project.duration_hours,
    duration_minutes: project.duration_minutes,
    main_characters: project.main_characters || "",
    primary_locations: project.primary_locations || "",
    central_theme: project.central_theme || "",
    tone: project.tone || "",
    script_url: project.script_url || undefined,
    script_status: project.script_status || "pending",
    voiceover_status: project.voiceover_status || "pending",
    voiceover_drive_folder: project.voiceover_drive_folder || null,
    thumbnail_suggestions: project.thumbnail_suggestions || undefined,
    video_status: project.video_status || null,
    video_drive_folder: project.video_drive_folder || null,
  };
}

// Check if a project is in progress (not finished or failed)
function isProjectInProgress(status: string): boolean {
  return !["Published", "Failed"].includes(status);
}

// Get status color
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "draft": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "sections_in_creation": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "voiceover": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "video_generation": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "published": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "failed": "bg-red-500/20 text-red-300 border-red-500/30",
    "pending": "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return colors[status.toLowerCase()] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
}

// Format date
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Custom Card Component
const Card = ({ children, className = "", hover = false }: { children: React.ReactNode, className?: string, hover?: boolean }) => (
  <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl ${hover ? 'hover:border-cyan-500/30 transition-all duration-300' : ''} ${className}`}>
    {children}
  </div>
);

// Custom Badge Component
const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantClasses = variant === "outline" 
    ? "border border-gray-700/50 text-gray-300" 
    : "bg-gray-700/50 text-white";
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

// Custom Progress Component
const Progress = ({ value, className = "" }: { value: number, className?: string }) => (
  <div className={`h-2 w-full bg-gray-700/50 rounded-full overflow-hidden ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Custom Tabs Component
const Tabs = ({ defaultValue, children }: { defaultValue: string, children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className="tabs">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        if (React.isValidElement(child) && child.type === TabsContent && child.props.value === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (value: string) => void }) => (
  <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 mb-6">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === TabsTrigger) {
        return React.cloneElement(child, { 
          active: child.props.value === activeTab,
          onClick: () => setActiveTab(child.props.value)
        } as any);
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ children, value, active, onClick }: { children: React.ReactNode, value: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value }: { children: React.ReactNode, value: string }) => (
  <div className="tab-content">
    {children}
  </div>
);

export default function DashboardPage() {
  const { videos, setVideos, isLoading, setIsLoading, error, setError } = useVideos();
  const { selectedChannel, isLoading: isChannelLoading } = useChannel();
  const previousChannelId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // New state for enhancements
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Define loadProjects FIRST to avoid circular dependency
  const loadProjects = useCallback(async (channelId: string | undefined, showLoadingState = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Now with signal parameter support
      const result = await fetchProjects(channelId, { signal: abortControllerRef.current.signal });

      if (result.success && result.projects) {
        const videoList = result.projects.map(projectToVideo);
        setVideos(videoList);
        setLastUpdated(new Date());
      } else {
        setError(result.error || "Failed to load projects");
      }
    } catch (err: unknown) {
      // Handle abort errors gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  }, [setVideos, setIsLoading, setError]);

  // Now define handleKeyDown AFTER loadProjects
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      loadProjects(selectedChannel?.channel_id, true);
    }
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Trigger "New Video" button if exists
      const newVideoBtn = document.querySelector('[data-new-video]');
      if (newVideoBtn instanceof HTMLElement) {
        newVideoBtn.click();
      }
    }
  }, [loadProjects, selectedChannel]);

  // Load preferred channel from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-channel');
    if (saved) {
      // Store in localStorage but not in state since we're not using it
    }
  }, []);

  // Save preferred channel when channel changes
  useEffect(() => {
    if (selectedChannel?.channel_id) {
      localStorage.setItem('preferred-channel', selectedChannel.channel_id);
    }
  }, [selectedChannel]);

  // Update document title based on selected channel
  useEffect(() => {
    if (selectedChannel) {
      document.title = `${selectedChannel.name} - Video Dashboard`;
    } else {
      document.title = 'Video Dashboard';
    }
    return () => {
      document.title = 'Video Dashboard'; // Reset on unmount
    };
  }, [selectedChannel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Memoize expensive calculations
  const hasInProgressProjects = useMemo(() => 
    videos.some((v) => isProjectInProgress(v.status)),
    [videos]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = videos.length;
    const inProgress = videos.filter(v => isProjectInProgress(v.status)).length;
    const published = videos.filter(v => v.status === "Published").length;
    const completionRate = total > 0 ? Math.round((published / total) * 100) : 0;
    
    return { total, inProgress, published, completionRate };
  }, [videos]);

  // Status counts for summary
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach(video => {
      counts[video.status] = (counts[video.status] || 0) + 1;
    });
    return counts;
  }, [videos]);

  // Filter and sort videos based on active tab
  const filteredVideos = useMemo(() => {
    let filtered = [...videos];
    
    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter(v => isProjectInProgress(v.status));
    } else if (activeTab === "published") {
      filtered = filtered.filter(v => v.status === "Published");
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.main_characters.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.central_theme.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(video => video.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [videos, activeTab, searchQuery, statusFilter, sortBy]);

  // Debounced version for polling
  const debouncedLoadProjects = useMemo(
    () => debounce((channelId: string | undefined, showLoadingState: boolean) => {
      loadProjects(channelId, showLoadingState);
    }, DEBOUNCE_DELAY),
    [loadProjects]
  );

  // Load projects when channel changes
  useEffect(() => {
    if (isChannelLoading) return;

    const currentChannelId = selectedChannel?.channel_id || undefined;

    // Only reload if channel actually changed
    if (previousChannelId.current !== currentChannelId) {
      previousChannelId.current = currentChannelId || null;
      loadProjects(currentChannelId, true);
    }
  }, [selectedChannel, isChannelLoading, loadProjects]);

  // Polling for updates when there are in-progress projects
  useEffect(() => {
    if (isChannelLoading) return;

    if (!hasInProgressProjects || isLoading) {
      return;
    }

    const channelId = selectedChannel?.channel_id || undefined;
    const intervalId = setInterval(() => {
      debouncedLoadProjects(channelId, false); // Use debounced version
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [videos, isLoading, selectedChannel, isChannelLoading, debouncedLoadProjects, hasInProgressProjects]);

  // Show loading while channel is loading
  if (isChannelLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <Loader2 className="relative h-12 w-12 text-cyan-400 animate-spin mb-6" />
            </div>
            <p className="text-lg font-light text-gray-300 animate-pulse">Loading your creative space...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show skeleton loader for projects loading
  if (isLoading && videos.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg animate-pulse mb-4" />
            <div className="h-4 w-48 bg-gradient-to-r from-gray-800 to-gray-700 rounded animate-pulse" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-32 animate-pulse" />
            ))}
          </div>
          
          {/* Videos skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
                  <Sparkles className="h-6 w-6 text-cyan-300" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
                  Video Studio
                </h1>
              </div>
              <p className="text-gray-400 font-light">
                {selectedChannel 
                  ? `Managing content for ${selectedChannel.name}`
                  : "Your creative production hub"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
                onClick={() => loadProjects(selectedChannel?.channel_id, true)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium gap-2 flex items-center transition-all">
                <Plus className="h-4 w-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-cyan-300" />
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                    Total
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
                <p className="text-sm text-gray-400">Video Projects</p>
              </div>
            </Card>

            <Card hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-300" />
                  </div>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    Active
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.inProgress}</p>
                <p className="text-sm text-gray-400">In Progress</p>
              </div>
            </Card>

            <Card hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-300" />
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                    Live
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.published}</p>
                <p className="text-sm text-gray-400">Published</p>
              </div>
            </Card>

            <Card hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                      Rate
                    </Badge>
                    {lastUpdated && (
                      <span className="text-xs text-gray-500">
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-white mb-1">{stats.completionRate}%</p>
                  <p className="text-sm text-gray-400">Completion Rate</p>
                </div>
                <Progress value={stats.completionRate} />
              </div>
            </Card>
          </div>
        </header>

        {/* Main Content */}
        <div className="mb-8">
          {/* Filters and Controls */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search projects, characters, themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 pr-10 text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="all">All Status</option>
                      {Object.keys(statusCounts).map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')} ({statusCounts[status]})
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 pr-10 text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "all" 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              All Projects
              <Badge className="ml-2 bg-gray-700/50">{videos.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "active" 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              In Progress
              <Badge className="ml-2 bg-cyan-500/20 text-cyan-300">{stats.inProgress}</Badge>
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "published" 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              Published
              <Badge className="ml-2 bg-emerald-500/20 text-emerald-300">{stats.published}</Badge>
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="mt-6">
            {error ? (
              <Card className="bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-sm border border-red-500/30 rounded-2xl">
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Failed to load projects</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <button
                    className="px-4 py-2 gap-2 border border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-lg flex items-center justify-center mx-auto"
                    onClick={() => loadProjects(selectedChannel?.channel_id, true)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                </div>
              </Card>
            ) : (
              <ErrorBoundary fallback={
                <Card className="bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                    <span className="text-red-300">Failed to load video list</span>
                  </div>
                </Card>
              }>
                <VideoList
                  videos={filteredVideos}
                  isLoading={isLoading}
                  viewMode={viewMode}
                  emptyMessage={
                    selectedChannel
                      ? `No videos yet for ${selectedChannel.name}. Start your creative journey!`
                      : "Select a channel to begin creating amazing content"
                  }
                />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Production Insights</h3>
              <p className="text-sm text-gray-400">
                {hasInProgressProjects 
                  ? `${stats.inProgress} projects are actively being worked on`
                  : "All caught up! Ready for new projects"
                }
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div 
                  key={status} 
                  className={`px-4 py-2 rounded-xl border backdrop-blur-sm ${getStatusColor(status)}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{status.replace('_', ' ')}</span>
                    <span className="text-xs opacity-80">{count}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-500">
              {lastUpdated ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ) : (
                <span>No data loaded yet</span>
              )}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
