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
    <header className="fixed top-0 left-0 w-full glow-nav z-50">
      <div className="h-14 flex items-center justify-between px-6 text-white">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <div className="w-px h-6 bg-white/30"></div>
          <span className="text-lg page-title">College Companion</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 relative">
          <Link
            to="/timetable"
            className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
          >
            <Calendar size={18} className="text-blue-400" /> Timetable
          </Link>

          <Link
            to="/attendance"
            className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
          >
            <CheckSquare size={18} className="text-blue-400" /> Attendance
          </Link>

          <Link
            to="/reminders"
            className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
          >
            <Bell size={18} className="text-blue-400" /> Reminders
          </Link>
          <Link
  to="/internship"
  className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
          >
  <Briefcase size={18} className="text-blue-400" /> Internships
</Link>

          <Link
            to="/profile"
            className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
          >
            
            <User size={18} className="text-blue-400" /> Profile
          </Link>

          {/* Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="glow-pill flex items-center gap-1 px-3 py-1 rounded-full"
            >
              <MoreVertical size={18} className="text-blue-400" /> More
            </button>

            {menuOpen && (
              <div
  className={`absolute right-0 mt-2 w-48 glow-card text-white rounded-2xl shadow-lg z-50 transform transition-all duration-700 ease-in-out ${
    menuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
  } origin-top`}
>
                
                
                
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield size={16} className="text-blue-400" />Dashboard
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn size={16} className="text-blue-400" /> Login
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl glow-pill transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glow-card text-white shadow-lg">
          <Link
            to="/timetable"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <Calendar size={16} className="inline mr-2 text-blue-400" /> Timetable
          </Link>
          <Link
            to="/attendance"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <CheckSquare size={16} className="inline mr-2 text-blue-400" /> Attendance
          </Link>
          <Link
            to="/reminders"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <Bell size={16} className="inline mr-2 text-blue-400" /> Reminders
          </Link>
          <Link
            to="/profile"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <User size={16} className="inline mr-2 text-blue-400" /> Profile
          </Link>
          
          <Link
            to="/internship"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <Briefcase size={16} className="inline mr-2 text-blue-400" /> Internship Tracker
          </Link>
          
          <Link
            to="/dashboard"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <Shield size={16} className="inline mr-2 text-blue-400" /> Dashboard
          </Link>
          <Link
            to="/login"
            className="block px-6 py-2 hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            <LogIn size={16} className="inline mr-2 text-blue-400" /> Login
          </Link>
        </div>
      )}
    </header>
  );
}
