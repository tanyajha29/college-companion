import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

// Import pages
import Home from "./pages/Home";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Remainders from "./pages/Remainders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/profile";
import InternshipTrackerPage from "./pages/InternshipTracker";

export default function App() {
  return (
    <div className="relative min-h-screen bg-gray-50 text-neutral-900">
      <Navbar />
      
      <Routes>
        {/*Landing Page*/}
        <Route path="/" element={<Home />} />

         {/*Other Page*/}
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/remainders" element={<Remainders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/internship" element={<InternshipTrackerPage />} />
      </Routes>
    </div>
  );
}
