// Team Productivity Dashboard - Safe Version
export default function TeamPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Team Productivity Dashboard</h1>
      <p className="text-gray-600 mb-6">Track your team's performance and workload</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="text-3xl font-bold">8</div>
          <div className="text-gray-600">Team Members</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="text-3xl font-bold">6</div>
          <div className="text-gray-600">Active Now</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <div className="text-3xl font-bold">78%</div>
          <div className="text-gray-600">Productivity</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="text-3xl font-bold">24</div>
          <div className="text-gray-600">Tasks Today</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Coming Soon Features:</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Individual team member performance</li>
          <li>Task assignment tracking</li>
          <li>Workload distribution charts</li>
          <li>Project timeline views</li>
          <li>Voiceover recording schedules</li>
        </ul>
      </div>
    </div>
  );
}
