import { Link } from "react-router-dom";
import {
  Calendar,
  CheckSquare,
  Bell,
  User,
  MoreVertical,
  BookOpen,
  Briefcase,
  Users,
  Shield,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-black via-blue-900 to-blue-600 shadow z-50">
      <div className="h-14 flex items-center justify-between px-6 text-white">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <div className="w-px h-6 bg-white"></div>
          <span className="text-lg">College Companion</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 relative">
          <Link
            to="/Timetable"
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
          >
            <Calendar size={18} /> Timetable
          </Link>

          <Link
            to="/Attendance"
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
          >
            <CheckSquare size={18} /> Attendance
          </Link>

          <Link
            to="/Reminders"
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
          >
            <Bell size={18} /> Reminders
          </Link>
          <Link
  to="/internship"
  className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
          >
  Internships
</Link>

          <Link
            to="/Profile"
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
          >
            
            <User size={18} /> Profile
          </Link>

          {/* Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 px-3 py-1 rounded-full border border-white hover:bg-white hover:text-blue-600 transition"
            >
              <MoreVertical size={18} /> More
            </button>

            {menuOpen && (
              <div
  className={`absolute right-0 mt-2 w-48 bg-white text-blue-900 rounded shadow-lg z-50 transform transition-all duration-700 ease-in-out ${
    menuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
  } origin-top`}
>
                <Link
                  to="/Exams"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <BookOpen size={16} /> Exams
                </Link>
                <Link
                  to="/Career"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Briefcase size={16} /> Career
                </Link>
                <Link
                  to="/Staff"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users size={16} /> Staff Panel
                </Link>
                <Link
                  to="/Admin"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield size={16} /> Admin Panel
                </Link>
                <Link
                  to="/Login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn size={16} /> Login
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-white hover:text-blue-600 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white text-blue-900 shadow-lg">
          <Link
            to="/Timetable"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <Calendar size={16} className="inline mr-2" /> Timetable
          </Link>
          <Link
            to="/Attendance"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <CheckSquare size={16} className="inline mr-2" /> Attendance
          </Link>
          <Link
            to="/Reminders"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <Bell size={16} className="inline mr-2" /> Reminders
          </Link>
          <Link
            to="/Profile"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <User size={16} className="inline mr-2" /> Profile
          </Link>
          <Link
            to="/Exams"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <BookOpen size={16} className="inline mr-2" /> Exams
          </Link>
          <Link
            to="/Career"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <Briefcase size={16} className="inline mr-2" /> Career
          </Link>
          <Link
            to="/Staff"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <Users size={16} className="inline mr-2" /> Staff Panel
          </Link>
          <Link
            to="/Admin"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <Shield size={16} className="inline mr-2" /> Admin Panel
          </Link>
          <Link
            to="/Login"
            className="block px-6 py-2 hover:bg-blue-100"
            onClick={() => setMobileOpen(false)}
          >
            <LogIn size={16} className="inline mr-2" /> Login
          </Link>
        </div>
      )}
    </header>
  );
}
