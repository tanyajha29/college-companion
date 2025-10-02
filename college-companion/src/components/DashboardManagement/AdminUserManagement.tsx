
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUserManagement() {
  const users = [
    { id: 1, name: 'Tanya', email: 'tanya@college.edu', role: 'student', dept: 'INFT' },
    { id: 2, name: 'John Doe', email: 'john@college.edu', role: 'staff', dept: 'COMP' },
    { id: 3, name: 'Admin User', email: 'admin@college.edu', role: 'admin', dept: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
          <Plus size={20} /> Add New User
        </button>
      </div>

      <motion.div 
        className="overflow-x-auto bg-white rounded-xl shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Role', 'Department', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'staff' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.dept}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                  <button title="Edit" className="text-indigo-600 hover:text-indigo-900 transition"><Edit size={16} /></button>
                  <button title="Delete" className="text-red-600 hover:text-red-900 transition"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}