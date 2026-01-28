import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import OTPInput from "../components/OTPInput";

export default function Register() {
  const nav = useNavigate();
  
  // STATE VARIABLES
  const [rollNumber, setRollNumber] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1"); 
  const [division, setDivision] = useState("A"); 
  const [designation, setDesignation] = useState("");
  const [contact_no, setContact] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("student"); 
  const [departmentId, setDepartmentId] = useState("1"); 
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification Flow
  const [step, setStep] = useState<"register" | "verify">("register");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && step === "verify") {
      setCanResend(true);
    }
  }, [otpTimer, step]);

  // Handle registration form submission (Step 1)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // --- Validation Checks ---
    if (username.trim().length < 3) return setErr("Username must be at least 3 characters.");
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    if (contact_no.trim().length < 10) return setErr("Enter a valid contact number.");

    if (role === "student" && rollNumber.trim().length === 0) 
      return setErr("Roll Number is required for students.");
    if ((role === "faculty" || role === "admin") && designation.trim().length === 0) 
      return setErr("Designation/Title is required for staff/admin.");

    try {
      setLoading(true);
      
      // Build payload
      let dbRole = 'Student';
      if (role === 'faculty') dbRole = 'Faculty';
      if (role === 'admin') dbRole = 'Admin';

      const payload: Record<string, any> = {
        username,
        email,
        password: pwd,
        contact_no,
        role: dbRole,
      };

      if (role !== 'admin') {
        payload.departmentId = parseInt(departmentId);
      }
      
      if (role === "student") { 
        payload.rollNumber = rollNumber;
        payload.yearOfStudy = parseInt(yearOfStudy);
        payload.division = division;
      }
      
      if (role === "faculty" || role === "admin") {
        payload.designation = designation;
      }

      // Request registration OTP
      const res = await fetch("http://localhost:5000/api/auth/request-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to request registration");
      }

      // Move to OTP verification step
      setStep("verify");
      setOtpTimer(data.expiresIn || 300); // 5 minutes
      setCanResend(false);
      setOtp("");
      setErr(null);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification (Step 2)
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (otp.length !== 6) {
      return setErr("Please enter a valid 6-digit OTP");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Store user data and redirect to login
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      
      if (role !== 'admin') {
        localStorage.setItem("departmentId", departmentId);
      }

      nav("/login");
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    setErr(null);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/resend-registration-otp", {
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

  // Handle back to registration form
  const handleBackToRegister = () => {
    setStep("register");
    setOtp("");
    setOtpTimer(0);
    setCanResend(false);
    setErr(null);
  };

  // Render Registration Step
  if (step === "register") {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-24" 
        style={{ backgroundImage: "url('/login_register_bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

        <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl border border-white/40">
          {/* Tabs */}
          <div className="flex justify-center mb-6 border-b">
            <Link
              to="/login"
              className="px-6 py-2 border-b-2 border-transparent text-gray-500 hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold"
            >
              Register
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Create Account
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Sign up to get started
          </p>

          {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={contact_no}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role !== "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="1">Information Technology</option>
                  <option value="2">Computer Engineering</option>
                  <option value="3">Electronics</option>
                  <option value="4">EXTC</option>
                </select>
              </div>
            )}

            {role === "student" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter your roll number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                  >
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Division
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </>
            )}

            {(role === "faculty" || role === "admin") && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Designation/Title
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g., Professor, Lecturer"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 font-medium shadow hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
            >
              {loading ? "Requesting OTP..." : "Sign Up & Verify Email"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render OTP Verification Step
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-24"
      style={{ backgroundImage: "url('/login_register_bg.jpeg')" }}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl border border-white/40">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Verify Your Email
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

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
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>

          {/* Resend & Timer */}
          <div className="text-center space-y-2">
            {otpTimer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-bold text-blue-600">{otpTimer}s</span>
              </p>
            ) : canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : null}
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={handleBackToRegister}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Registration
          </button>
        </form>
      </div>
    </div>
  );
}
