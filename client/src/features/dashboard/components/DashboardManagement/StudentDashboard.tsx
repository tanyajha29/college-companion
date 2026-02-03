// src/components/DashboardManagement/StudentDashboard.tsx

import { motion } from "framer-motion";
import { BookOpen, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}
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
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [electives, setElectives] = useState<{ courseid: number; coursename: string }[]>([]);
  const [selectedElective, setSelectedElective] = useState<number | "">("");
  const [cbcMessage, setCbcMessage] = useState<string | null>(null);

  const askFAQ = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/ai/faq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get answer");
      setAnswer(data.answer);
    } catch (e: any) {
      setAnswer(e.message || "Sorry, something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadElectives = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/cbc/electives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setElectives(data);
    } catch {
      // ignore
    }
  };

  const selectElective = async () => {
    if (!selectedElective) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/cbc/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: selectedElective }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to select elective");
      setCbcMessage("Elective added successfully.");
    } catch (e: any) {
      setCbcMessage(e.message || "Failed to select elective.");
    }
  };

  useEffect(() => {
    loadElectives();
  }, []);

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const payFees = async () => {
    try {
      setPaying(true);
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay checkout.");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 1000, currency: "INR" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "College Companion",
        description: "Fee Payment (Test)",
        order_id: data.orderId,
        handler: async (response: any) => {
          await fetch(`${API_BASE}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });
          window.open(`${API_BASE}/api/payments/receipt/${data.orderId}`, "_blank");
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setAnswer(e.message || "Failed to initiate payment.");
    } finally {
      setPaying(false);
    }
  };

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

      {/* 5. FAQ Chatbot */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Ask the FAQ Bot</h3>
        <p className="text-sm text-gray-500 mb-4">Ask things like “When is the next fee deadline?”</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={askFAQ}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>
        {answer && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700">
            {answer}
          </div>
        )}
      </motion.div>

      {/* 6. Fee Payment */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Pay Fees (Sandbox)</h3>
        <p className="text-sm text-gray-500 mb-4">Make a test payment and receive a PDF receipt.</p>
        <button
          onClick={payFees}
          disabled={paying}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {paying ? "Starting Checkout..." : "Pay ₹1000"}
        </button>
      </motion.div>

      {/* 7. CBCS Elective Selection */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Elective (CBCS)</h3>
        <div className="flex gap-3 items-center">
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedElective}
            onChange={(e) => setSelectedElective(Number(e.target.value))}
          >
            <option value="">Select elective</option>
            {electives.map((c) => (
              <option key={c.courseid} value={c.courseid}>
                {c.coursename}
              </option>
            ))}
          </select>
          <button
            onClick={selectElective}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add Elective
          </button>
        </div>
        {cbcMessage && <p className="text-sm text-gray-600 mt-2">{cbcMessage}</p>}
      </motion.div>

    </div>
  );
}
