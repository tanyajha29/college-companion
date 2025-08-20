import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-neutral-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-semibold mb-2 text-emerald-600">
          Welcome to College Companion
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          Manage timetable, attendance, reminders, and career tracking in one place.
        </p>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 rounded-lg border bg-white shadow">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 rounded-lg border bg-emerald-600 text-white">
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
