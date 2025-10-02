
import { Users, Briefcase, BookOpen, TrendingUp, Filter } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data for Key Metrics
const stats = [
  { id: 1, name: 'Total Users', value: '4,521', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 2, name: 'Active Staff', value: '124', icon: Briefcase, color: 'text-green-500', bgColor: 'bg-green-50' },
  { id: 3, name: 'Departments', value: '8', icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { id: 4, name: 'New Registrations (Last 30 Days)', value: '345', icon: TrendingUp, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
];

// Mock Chart Data Structure (usually fed to a charting library like Chart.js or Recharts)
const mockChartData = [
    { month: 'Jan', students: 150, staff: 15 },
    { month: 'Feb', students: 160, staff: 18 },
    { month: 'Mar', students: 175, staff: 20 },
    { month: 'Apr', students: 180, staff: 22 },
];

export default function AdminReportDashboard() {
  return (
    <div className="space-y-8">
      
      {/* 1. Filters and Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700">Analytics Overview</h3>
        <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border hover:bg-gray-100 transition">
                <Filter size={16} /> Filter by Department
            </button>
            <input 
                type="date" 
                className="px-3 py-2 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue={new Date().toISOString().split('T')[0]} // Current Date
            />
        </div>
      </div>
      
      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={item.id}
            className={`p-5 rounded-xl shadow-lg border border-gray-200 ${item.bgColor} flex items-center gap-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={`p-3 rounded-full ${item.bgColor === 'bg-blue-50' ? 'bg-blue-100' : item.bgColor.replace('-50', '-100')}`}>
                <item.icon size={24} className={item.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.name}</p>
              <p className="text-3xl font-extrabold text-gray-900">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Chart / Data Visualization */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Monthly Enrollment Trend</h3>
        <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg border border-dashed">
            {/* 💡 Replace this div with an actual Chart.js, Recharts, or similar component */}
            <p className="text-gray-500">CHART GOES HERE (e.g., Line Chart tracking {mockChartData.length} months)</p>
        </div>
      </motion.div>
      
      {/* 4. Detailed Data Table Placeholder */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Detailed Report Breakdown</h3>
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
            This area is reserved for a detailed, filterable table of report data (e.g., User Activity Log or Departmental Performance).
        </div>
      </motion.div>
    </div>
  );
}