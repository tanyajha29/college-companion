import { Routes, Route } from "react-router-dom";
import Home from "../features/home/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Timetable from "../features/timetable/pages/Timetable";
import Attendance from "../features/attendance/pages/Attendance";
import Remainders from "../features/reminders/pages/Reminders";
import App from "../App";
import Dashboard from "../features/dashboard/pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/timetable" element={<Timetable />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/reminders" element={<Remainders />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  );
}
