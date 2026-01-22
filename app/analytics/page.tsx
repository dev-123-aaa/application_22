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

<div className="rounded-xl bg-gradient-to-br from-gray-900 to-black p-6 border border-gray-800">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-white">⚡ Active Execution</h3>
      <p className="text-sm text-gray-400 mt-1">What&apos;s being worked on right now</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
        <span className="text-sm text-green-400">Live Tracking</span>
      </div>
      <div className="text-sm text-gray-400">
        Updated: <span className="text-white">Just now</span>
      </div>
    </div>
  </div>

  {/* Current Tasks Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {[
      { 
        task: "Voiceover: Naruto&apos;s Return Analysis", 
        assignee: "Sarah VO", 
        time: "2h 15m remaining",
        status: "recording",
        progress: 65,
        channel: "Naruto",
        urgency: "high"
      },
      { 
        task: "Script: Akatsuki Lore Part 3", 
        assignee: "Alex Writer", 
        time: "4h 30m elapsed",
        status: "writing",
        progress: 40,
        channel: "Naruto",
        urgency: "medium"
      },
      { 
        task: "Editing: Hidden Leaf History", 
        assignee: "Mike Designer", 
        time: "1h 20m remaining",
        status: "editing",
        progress: 80,
        channel: "Naruto",
        urgency: "medium"
      },
      { 
        task: "Thumbnail: AOT Titan Analysis", 
        assignee: "David Dev", 
        time: "3h elapsed",
        status: "designing",
        progress: 60,
        channel: "Attack on Titan",
        urgency: "low"
      },
      { 
        task: "Audio Mix: Demon Slayer Lore", 
        assignee: "Lisa QA", 
        time: "45m remaining",
        status: "editing",
        progress: 90,
        channel: "Demon Slayer",
        urgency: "high"
      },
      { 
        task: "Research: One Piece Timeline", 
        assignee: "Emma PM", 
        time: "6h elapsed",
        status: "research",
        progress: 30,
        channel: "One Piece",
        urgency: "low"
      },
    ].map((item, index) => (
      <div key={index} className={`p-4 rounded-lg border ${
        item.urgency === 'high' ? 'border-red-500/30 bg-red-500/5' :
        item.urgency === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
        'border-gray-700 bg-gray-800/20'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.status === 'recording' ? 'bg-yellow-500/20 text-yellow-400' :
                item.status === 'writing' ? 'bg-blue-500/20 text-blue-400' :
                item.status === 'editing' ? 'bg-purple-500/20 text-purple-400' :
                item.status === 'designing' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {item.status}
              </span>
              <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                {item.channel}
              </span>
            </div>
            <h4 className="font-medium text-white text-sm line-clamp-2">{item.task}</h4>
          </div>
          {item.urgency === 'high' && (
            <span className="text-red-400 text-xs font-medium">❗ PRIORITY</span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{item.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                item.urgency === 'high' ? 'bg-red-500' :
                item.urgency === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-sm text-gray-300">{item.assignee}</span>
          </div>
          <div className="text-xs text-gray-400">{item.time}</div>
        </div>
      </div>
    ))}
  </div>
  
  {/* Upcoming Queue */}
  <div className="border-t border-gray-800 pt-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-white">📋 Upcoming in Queue</h4>
      <span className="text-sm text-gray-400">Next 24-48 hours</span>
    </div>
    
    <div className="space-y-3">
      {[
        { task: "Script review: Uchiha History", channel: "Naruto", assignee: "Emma PM", readyIn: "4h" },
        { task: "Voiceover: Titan Origins", channel: "Attack on Titan", assignee: "Sarah VO", readyIn: "Tomorrow AM" },
        { task: "Edit review: Demon Blood Arts", channel: "Demon Slayer", assignee: "Lisa QA", readyIn: "6h" },
        { task: "Thumbnail design: Saiyan Saga", channel: "Dragon Ball", assignee: "David Dev", readyIn: "Tomorrow" },
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
              <span className="text-sm">⏱️</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{item.task}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{item.channel}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">Assigned to {item.assignee}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-yellow-400 font-medium">{item.readyIn}</div>
            <div className="text-xs text-gray-400">Starts in</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Quick Actions */}
  <div className="mt-6 pt-6 border-t border-gray-800">
    <h4 className="font-semibold text-white mb-4">🚀 Quick Actions</h4>
    <div className="flex flex-wrap gap-3">
      <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors">
        + Add New Task
      </button>
      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
        🔄 Reassign Tasks
      </button>
      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
        📊 Update Progress
      </button>
      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
        ⚡ Mark Complete
      </button>
    </div>
  </div>
</div>

{/* Daily Standup Section */}
<div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-white">📅 Daily Standup</h3>
      <p className="text-sm text-gray-400 mt-1">Today&apos;s focus &amp; blockers</p>
    </div>
    <div className="text-sm text-gray-400">
      <span className="text-white">January 22, 2026</span> • Week 4
    </div>
  </div>

  {/* Team Status */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[
      { 
        name: "Alex Writer", 
        status: "Writing", 
        task: "Akatsuki Script", 
        time: "4h today", 
        available: true,
        avatar: "AW",
        color: "bg-blue-500/20 text-blue-400"
      },
      { 
        name: "Sarah VO", 
        status: "Recording", 
        task: "Naruto Analysis", 
        time: "3h booked", 
        available: true,
        avatar: "SV",
        color: "bg-yellow-500/20 text-yellow-400"
      },
      { 
        name: "Mike Designer", 
        status: "Editing", 
        task: "Hidden Leaf", 
        time: "5h remaining", 
        available: true,
        avatar: "MD",
        color: "bg-purple-500/20 text-purple-400"
      },
      { 
        name: "David Dev", 
        status: "Designing", 
        task: "AOT Thumbnail", 
        time: "2h today", 
        available: false,
        avatar: "DD",
        color: "bg-cyan-500/20 text-cyan-400"
      },
    ].map((member, index) => (
      <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${member.available ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-white">{member.name}</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs ${member.color}`}>
            {member.status}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${member.color.split(' ')[0]} border ${member.color.split(' ')[1].replace('text-', 'border-')}`}>
            <span className="text-xs font-medium">{member.avatar}</span>
          </div>
          <div>
            <div className="text-sm text-gray-300">{member.task}</div>
            <div className="text-xs text-gray-400 mt-1">{member.time}</div>
          </div>
        </div>
        
        <div className="text-xs">
          {member.available ? (
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Available for tasks
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              In deep work mode
            </span>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Today's Goals */}
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-white">🎯 Today&apos;s Goals</h4>
      <span className="text-xs text-gray-400">3/5 completed</span>
    </div>
    <div className="space-y-2">
      {[
        { 
          goal: "Complete Naruto Return voiceover", 
          progress: 2, 
          total: 3, 
          priority: "high",
          assignee: "Sarah VO",
          status: "in-progress"
        },
        { 
          goal: "Finish Akatsuki script draft", 
          progress: 1, 
          total: 2, 
          priority: "medium",
          assignee: "Alex Writer",
          status: "in-progress"
        },
        { 
          goal: "Edit Hidden Leaf video", 
          progress: 1, 
          total: 1, 
          priority: "low",
          assignee: "Mike Designer",
          status: "completed"
        },
        { 
          goal: "Design AOT thumbnail", 
          progress: 0, 
          total: 1, 
          priority: "medium",
          assignee: "David Dev",
          status: "not-started"
        },
      ].map((goal, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/20 rounded hover:bg-gray-800/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              goal.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {goal.status === 'completed' ? '✓' : goal.status === 'in-progress' ? '⟳' : '○'}
            </div>
            <div>
              <div className="text-sm text-white">{goal.goal}</div>
              <div className="text-xs text-gray-400 mt-1">{goal.assignee}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded text-xs ${
              goal.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              goal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {goal.priority}
            </div>
            <div className="text-sm text-white text-right">
              {goal.progress}/{goal.total}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Blockers Section */}
  <div>
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-white">🛑 Current Blockers</h4>
      <span className="text-xs text-gray-400">2 active blockers</span>
    </div>
    
    <div className="space-y-3">
      {/* Blocker 1 */}
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-400">⚠️</span>
          <span className="text-sm font-medium text-white">Audio quality issues</span>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Critical</span>
        </div>
        <p className="text-sm text-gray-300">Naruto Return recording has background noise. Need audio cleanup before editing.</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-xs text-gray-400">Blocking: <span className="text-white">Sarah VO</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Started: 2h ago</span>
            <button className="text-xs text-cyan-400 hover:text-cyan-300">
              Mark resolved →
            </button>
          </div>
        </div>
      </div>
      
      {/* Blocker 2 */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-yellow-400">ℹ️</span>
          <span className="text-sm font-medium text-white">Script review delayed</span>
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Medium</span>
        </div>
        <p className="text-sm text-gray-300">Akatsuki script waiting for historical accuracy check from research team.</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-xs text-gray-400">Affects: <span className="text-white">Alex Writer</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">ETA: Tomorrow AM</span>
            <button className="text-xs text-cyan-400 hover:text-cyan-300">
              Escalate →
            </button>
          </div>
        </div>
      </div>
      
      {/* No Blockers Message (when all clear) */}
      <div className="hidden p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span className="text-sm font-medium text-white">No active blockers</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">All systems are running smoothly. Keep up the good work!</p>
      </div>
    </div>
  </div>

  {/* Quick Status Update */}
  <div className="mt-6 pt-6 border-t border-gray-800">
    <h4 className="font-medium text-white mb-3">💬 Quick Status Update</h4>
    <div className="flex gap-3">
      <div className="flex-1">
        <textarea 
          placeholder="What did you work on yesterday? What are you working on today? Any blockers?"
          className="w-full p-3 bg-gray-800/30 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
          rows={3}
        />
      </div>
      <button className="self-end px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
        Update Status
      </button>
    </div>
    <div className="flex gap-2 mt-3">
      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">
        🎯 On track
      </button>
      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">
        ⚠️ Blocked
      </button>
      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">
        🏃 Behind
      </button>
      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">
        ✅ Ahead
      </button>
    </div>
  </div>
</div>
        
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
