"use client";

import { StatsOverview } from "@/components/analytics/StatsOverview";
import { ViewsChart } from "@/components/analytics/ViewsChart";
import { TopVideosChart } from "@/components/analytics/TopVideosChart";
import { PerformanceTable } from "@/components/analytics/PerformanceTable";
import {
  channelStats,
  videoAnalytics,
  dailyViews,
  getTopVideos,
} from "@/lib/mock-analytics";

export default function AnalyticsPage() {
  const topVideos = getTopVideos(5);

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-extralight tracking-wide text-white">
          Analytics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Channel performance and video metrics
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Overview */}
        <StatsOverview stats={channelStats} />

  <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-6">📋 Project Pipeline</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { stage: 'Scripting', color: 'bg-blue-500', count: 3 },
              { stage: 'Recording', color: 'bg-yellow-500', count: 2 },
              { stage: 'Editing', color: 'bg-purple-500', count: 4 },
              { stage: 'Review', color: 'bg-pink-500', count: 1 },
              { stage: 'Published', color: 'bg-green-500', count: 12 },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`${item.color} w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <div className="text-sm text-gray-300">{item.stage}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between gap-3 text-sm">
              <span className="text-gray-400">Total Projects: <span className="text-white font-medium">22</span></span>
              <span className="text-green-400">Completion Rate: <span className="text-white font-medium">54%</span></span>
              <span className="text-yellow-400">Avg Time: <span className="text-white font-medium">14 days</span></span>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ViewsChart data={dailyViews} />
          <TopVideosChart videos={topVideos} />
        </div>

        {/* Performance Table */}
        <PerformanceTable videos={videoAnalytics} />
      </div>
    </main>
  );
}
