import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import OTPInput from "../components/OTPInput";

export default function Login() {
  const nav = useNavigate();
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("INFT");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "verify">("login");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [channel, setChannel] = useState("email");

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && step === "verify") {
      setCanResend(true);
    }
  }, [otpTimer, step]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd, channel }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setStep("verify");
      setOtpTimer(data.expiresIn || 300);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (otp.length !== 6) {
      return setErr("Please enter a valid 6-digit OTP");
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user?.role || role);
      localStorage.setItem("department", department);

      nav("/");
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErr(null);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setOtp("");
      setOtpTimer(data.expiresIn || 300);
      setCanResend(false);
      setErr(null);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp("");
    setOtpTimer(0);
    setCanResend(false);
    setErr(null);
  };

  if (step === "verify") {
    return (
      <div
        className="glow-page relative min-h-screen flex items-center justify-center bg-cover bg-center pt-24"
        style={{ backgroundImage: "url('/login_register_bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

        <div className="glow-card relative w-full max-w-md p-8 rounded-3xl shadow-2xl">
          <h2 className="page-title text-2xl font-bold mb-2 text-center">Verify Login</h2>
          <p className="text-sm text-center text-slate-300 mb-6">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          {err && <div className="mb-4 text-sm text-red-400">{err}</div>}

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <OTPInput
              length={6}
              onChange={(value) => setOtp(value)}
              onComplete={(value) => setOtp(value)}
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 font-medium shadow hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <div className="text-center space-y-2">
              {otpTimer > 0 ? (
                <p className="text-sm text-slate-300">
                  Resend OTP in <span className="font-bold text-blue-400">{otpTimer}s</span>
                </p>
              ) : canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-center text-sm text-slate-300 hover:text-white"
            >
              ← Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glow-page relative min-h-screen flex items-center justify-center bg-cover bg-center pt-24"
      style={{ backgroundImage: "url('/login_register_bg.jpeg')" }}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

      <div className="glow-card relative w-full max-w-md p-8 rounded-3xl shadow-2xl">
        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b border-white/10">
          <Link to="/login" className="px-6 py-2 border-b-2 border-blue-400 text-blue-300 font-semibold">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2 border-b-2 border-transparent text-slate-300 hover:text-blue-300">
            Register
          </Link>
        </div>

        <h2 className="page-title text-2xl font-bold mb-2 text-center">Welcome Back</h2>
        <p className="text-sm text-center text-slate-300 mb-6">Sign in to continue</p>

        {err && <div className="mb-4 text-sm text-red-400">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl px-4 py-2 outline-none bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl px-4 py-2 outline-none bg-transparent"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* OTP Channel */}
          <div>
            <label className="block text-sm font-medium text-slate-300">MFA Channel</label>
            <select
              className="mt-1 w-full rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="email">Email</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">SMS coming soon.</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300">User Type</label>
            <select
              className="mt-1 w-full rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

         {/* Department */}
{role !== "admin" && (
  <div>
        <label className="block text-sm font-medium text-slate-300">
      Department
    </label>
    <select
          className="mt-1 w-full rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent"
      value={department}
      onChange={(e) => setDepartment(e.target.value)}
    >
      <option value="INFT">INFT</option>
      <option value="CMPN">CMPN</option>
      <option value="EXCS">EXCS</option>
      <option value="EXTC">EXTC</option>
    </select>
  </div>
)}


          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 font-medium shadow hover:from-blue-700 hover:to-blue-800 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
