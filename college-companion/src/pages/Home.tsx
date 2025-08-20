import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div
      className="relative h-screen bg-cover bg-center pt-14"
      style={{ backgroundImage: "url('//vite.svg')" }}
    >
      {/* Overlay layer */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>

      {/* Content */}
      <div className="relative flex items-center justify-center h-full">
        <div className="p-12 rounded-xl text-white max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to College Companion
          </h1>
          <p className="mb-6 text-lg">
            Manage timetable, attendance, reminders, and career tracking in one
            place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 rounded-full border border-white text-white hover:bg-white hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 rounded-full bg-white text-blue-600 hover:bg-blue-100 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
