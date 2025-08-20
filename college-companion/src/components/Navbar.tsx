import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-black via-blue-900 to-blue-600 shadow z-50">
      <div className="h-14 flex items-center justify-between px-4 text-white">
        
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <div className="w-px h-6 bg-white"></div> 
          <span className="text-lg">College Companion</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link to="/Timetable" className="px-4 py-1 rounded-full border border-white text-white hover:bg-white hover:text-blue-600 transition">
            Timetable
          </Link>
          <Link to="/Attendance" className="px-4 py-1 rounded-full border border-white text-white hover:bg-white hover:text-blue-600 transition">
           Attendance 
          </Link>
          <Link to="/Remainders" className="px-4 py-1 rounded-full border border-white text-white hover:bg-white hover:text-blue-600 transition">
           Remainders 
          </Link>
          <Link
            to="/Login"
            className="px-4 py-1 rounded-full border border-white text-white hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
