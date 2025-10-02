// src/components/AdminDepartmentManagement.tsx

import React, { useState } from "react";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data (Replace this with a state variable populated from your API)
const initialDepartments = [
  { id: 1, name: 'Information Technology', code: 'INFT', staffCount: 12 },
  { id: 2, name: 'Computer Engineering', code: 'COMP', staffCount: 15 },
  { id: 3, name: 'Electronics & Telecommunications', code: 'EXTC', staffCount: 10 },
  { id: 4, name: 'Computer Science', code: 'EXCS', staffCount: 8 },
];

 function AdminDepartmentManagement() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '' });

  // Placeholder function for API call
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    
    // 🎯 In a real application: Send POST request to backend here
    
    // Mock update:
    const newId = departments.length ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    const addedDept = { 
      id: newId, 
      name: newDept.name, 
      code: newDept.code.toUpperCase(), 
      staffCount: 0 
    };
    
    setDepartments([...departments, addedDept]);
    setNewDept({ name: '', code: '' });
    setIsModalOpen(false);
  };

  // Placeholder function for API call
  const handleDeleteDepartment = (id: number) => {
    // 🎯 In a real application: Send DELETE request to backend here
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter(dept => dept.id !== id));
    }
  };
  
  // Note: Edit functionality is often handled inline or via a separate form/modal
  const handleEdit = (id: number) => {
      alert(`Editing Department ID: ${id}. Implement your edit modal/form logic here.`);
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-900 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
        >
          <Plus size={20} /> Add Department
        </button>
      </div>

      {/* Departments Table */}
      <motion.div 
        className="overflow-hidden bg-white rounded-xl shadow-md border border-gray-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Name', 'Code', 'Staff Count', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence initial={false}>
            {departments.map((dept) => (
              <motion.tr 
                key={dept.id} 
                className="hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {dept.code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dept.staffCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                  <button title="Edit" onClick={() => handleEdit(dept.id)} className="text-indigo-600 hover:text-indigo-900 transition"><Edit size={16} /></button>
                  <button title="Delete" onClick={() => handleDeleteDepartment(dept.id)} className="text-red-600 hover:text-red-900 transition"><Trash2 size={16} /></button>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
        {departments.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No departments found. Click "Add Department" to get started.
            </div>
        )}
      </motion.div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Add New Department</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700">Department Name</label>
                  <input
                    id="dept-name"
                    type="text"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dept-code" className="block text-sm font-medium text-gray-700">Department Code (e.g., INFT)</label>
                  <input
                    id="dept-code"
                    type="text"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Save size={20} /> Save Department
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminDepartmentManagement;