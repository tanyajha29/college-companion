import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("INFT");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Name required.");
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    if (pwd !== confirmPwd) return setErr("Passwords do not match.");

    // ✅ Save role & department
    localStorage.setItem("role", role);
    localStorage.setItem("department", department);

    nav("/Home"); // redirect after register
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-20"
      style={{ backgroundImage: "url('/welcome.png')" }}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-60 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl border border-white/40">
        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b">
          <Link to="/login" className="px-6 py-2 border-b-2 border-transparent text-gray-500 hover:text-blue-600">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Register
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Create Account</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Fill in your details</p>

        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">User Type</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={role === "student"} // Students fixed dept
            >
              <option value="INFT">INFT</option>
              <option value="CMPN">CMPN</option>
              <option value="EXCS">EXCS</option>
              <option value="EXTC">EXTC</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 font-medium shadow hover:from-blue-700 hover:to-blue-800 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
