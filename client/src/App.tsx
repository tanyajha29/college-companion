import Navbar from "./shared/components/Navbar";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Import pages
import Home from "./features/home/pages/Home";
import Timetable from "./features/timetable/pages/Timetable";
import Attendance from "./features/attendance/pages/Attendance";
import Remainders from "./features/reminders/pages/Reminders";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Dashboard from "./features/dashboard/pages/Dashboard";
import ProfilePage from "./features/profile/pages/Profile";
import InternshipTrackerPage from "./features/internship/pages/InternshipTracker";

export default function App() {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
  const [notifications, setNotifications] = useState<{ title: string; message: string; createdAt: string }[]>([]);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });
    socket.on("notification", (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 3));
    });
    return () => socket.disconnect();
  }, [API_BASE]);

  return (
    <div className="relative min-h-screen bg-gray-50 text-neutral-900">
      <Navbar />

      {notifications.length > 0 && (
        <div className="fixed top-16 right-4 z-50 space-y-2">
          {notifications.map((n, idx) => (
            <div key={idx} className="bg-white border border-blue-200 shadow-lg rounded-lg p-3 w-72">
              <p className="text-sm font-semibold text-blue-700">{n.title}</p>
              <p className="text-xs text-gray-600 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
      
      <Routes>
        {/*Landing Page*/}
        <Route path="/" element={<Home />} />

         {/*Other Page*/}
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reminders" element={<Remainders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/internship" element={<InternshipTrackerPage />} />
      </Routes>
    </div>
  );
}
