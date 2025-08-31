import Navbar from "./components/Navbar";
import { Link, Routes, Route } from "react-router-dom";

// Import your pages
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
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <div className="relative min-h-screen">
              {/* Background Image with Navy Overlay */}
              <div className="absolute inset-0">
                <img
                  src="/welcome.jpg" // put your image inside /public/
                  alt="Welcome"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900 bg-opacity-70" />
              </div>

              {/* Main Content */}
              <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Welcome to College Companion
                </h1>
                <p className="text-lg text-gray-200 mb-8 max-w-xl">
                  Manage timetable, attendance, reminders, and career tracking in one place.
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg border border-white bg-white/90 text-blue-900 shadow hover:bg-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700"
                  >
                    Create Account
                  </Link>
                </div>
              </main>
            </div>
          }
        />

        {/* Other Pages */}
         <Route path="/profile" element={<ProfilePage />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/remainders" element={<Remainders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/internship"element={<InternshipTrackerPage/>}/>

      </Routes>
    </div>
  );
}
