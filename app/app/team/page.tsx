export default function TeamPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Productivity</h1>
      <p className="text-gray-600 mb-6">Track your team performance and workload</p>
      
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
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <div className="font-medium">Alex Writer</div>
                <div className="text-sm text-gray-500">Script Writer</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">3 tasks</div>
              <div className="text-sm text-green-600">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
