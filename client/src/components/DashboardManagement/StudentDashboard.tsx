// src/components/DashboardManagement/StudentDashboard.tsx

import { motion } from "framer-motion";
import { BookOpen, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";

// Mock Data
const studentData = {
    name: "Alex Smith",
    department: "Information Technology (INFT)",
    gpa: 3.75,
    nextClass: {
        time: "10:00 AM",
        subject: "Data Structures & Algorithms",
        room: "Room 305",
    },
    upcomingAssignments: [
        { id: 1, name: "Database Design Project", subject: "DBM", dueDate: "Oct 15", priority: "High" },
        { id: 2, name: "Algorithms Quiz", subject: "DSA", dueDate: "Oct 20", priority: "Medium" },
    ],
    recentGrades: [
        { id: 1, subject: "Networking", grade: "A-", date: "Sep 28" },
        { id: 2, subject: "Calculus", grade: "B+", date: "Sep 20" },
    ]
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      
      {/* 1. Welcome & GPA Overview */}
      <motion.div 
        className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-l-blue-500"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h2 className="text-3xl font-bold text-gray-800">Hello, {studentData.name}!</h2>
        <p className="text-lg text-gray-600 mt-1">
          Welcome to your student portal for **{studentData.department}**.
        </p>
        
        <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-600">
                <TrendingUp size={20} />
                <span className="text-xl font-semibold">Current GPA: {studentData.gpa}</span>
            </div>
            <p className="text-sm text-gray-500">Keep up the great work!</p>
        </div>
      </motion.div>
      
      {/* 2. Key Panels (Next Class & Assignments) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Class Panel */}
        <motion.div 
          className="lg:col-span-1 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} className="text-blue-600" />
            <h3 className="text-xl font-semibold text-blue-800">Your Next Class</h3>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">{studentData.nextClass.time}</p>
          <p className="text-lg text-gray-700 mt-2">{studentData.nextClass.subject}</p>
          <p className="text-sm text-gray-500">{studentData.nextClass.room}</p>
        </motion.div>
        
        {/* Upcoming Assignments Panel */}
        <motion.div 
          className="lg:col-span-2 p-6 bg-white rounded-xl shadow-md border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4 border-b pb-2">
            <Clock size={24} className="text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Pending Assignments</h3>
          </div>
          
          <ul className="space-y-3">
            {studentData.upcomingAssignments.map((task) => (
              <li key={task.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-900">{task.name} <span className="text-xs text-gray-500 ml-2">({task.subject})</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${task.priority === 'High' ? 'text-red-500' : 'text-yellow-600'}`}>
                        {task.priority} Priority
                    </span>
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Due: {task.dueDate}
                    </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      
      {/* 3. Recent Grades Table/List */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4 border-b pb-2">
            <CheckCircle size={24} className="text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Your Recent Grades</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {studentData.recentGrades.map((grade) => (
                <div key={grade.id} className="p-4 bg-gray-50 rounded-lg shadow-sm text-center">
                    <p className="text-sm text-gray-500">{grade.subject}</p>
                    <p className="text-3xl font-extrabold text-green-700 mt-1">{grade.grade}</p>
                    <p className="text-xs text-gray-400 mt-1">on {grade.date}</p>
                </div>
            ))}
        </div>
      </motion.div>
      
      {/* 4. Link to Full Resources */}
      <div className="text-center pt-4">
        <button className="flex items-center mx-auto gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <BookOpen size={20} /> View Full Academic Transcript
        </button>
      </div>

    </div>
  );
}