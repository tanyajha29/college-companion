import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Timetable from "../pages/Timetable";
import Attendance from "../pages/Attendance";
import Remainders from "../pages/Remainders";
import App from "../App";
import Dashboard from "./pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Timetable" element={<Timetable />} />
      <Route path="/Attendance" element={<Attendance />} />
      <Route path="/Remainders" element={<Remainders />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  );
}
