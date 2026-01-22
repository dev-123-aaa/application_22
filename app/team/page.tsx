import { Users, Activity, TrendingUp, CheckCircle } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-light text-white">Team Productivity</h1>
        </div>
        <p className="text-gray-400 font-light">
          Track your team's performance and workload
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">8</div>
          <div className="text-gray-400">Team Members</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Now</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">6</div>
          <div className="text-gray-400">Active Now</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Avg</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">78%</div>
          <div className="text-gray-400">Productivity</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Today</span>
          </div>
          <div className="text-3xl font-light text-white mb-1">24</div>
          <div className="text-gray-400">Tasks Today</div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <h2 className="text-xl font-light text-white mb-6">Team Members</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-300">AW</span>
              </div>
              <div>
                <div className="font-medium text-white">Alex Writer</div>
                <div className="text-sm text-gray-400">Script Writer</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">3 tasks</div>
              <div className="text-sm text-green-400">Active</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-300">SV</span>
              </div>
              <div>
                <div className="font-medium text-white">Sarah VO</div>
                <div className="text-sm text-gray-400">Voiceover Artist</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">2 tasks</div>
              <div className="text-sm text-yellow-400">Recording</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-300">ME</span>
              </div>
              <div>
                <div className="font-medium text-white">Mike Editor</div>
                <div className="text-sm text-gray-400">Video Editor</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">4 tasks</div>
              <div className="text-sm text-blue-400">Editing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-light text-white mb-4">Coming Soon</h3>
        <ul className="text-gray-400 space-y-2">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            Task assignment and tracking system
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            Video production timeline views
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
            Workload balancing charts
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
            Voiceover recording schedules
          </li>
        </ul>
      </div>
    </div>
  );
}
