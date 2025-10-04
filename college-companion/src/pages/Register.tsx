import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  
  // STATE VARIABLES
  const [rollNumber, setRollNumber] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1"); 
  const [division, setDivision] = useState("A"); 
  const [designation, setDesignation] = useState(""); // For Faculty/Staff/Admin
  
  const [contact_no, setContact] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  
  // ⚠️ ROLE MAPPING: Now using 'student', 'faculty', 'admin' in state.
  const [role, setRole] = useState("student"); 
  
  // DEPT: Changed state to 'departmentId' and using numeric IDs
  const [departmentId, setDepartmentId] = useState("1"); 
  
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // --- Validation Checks ---
    if (username.trim().length < 3) return setErr("Username must be at least 3 characters.");
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters.");
    if (contact_no.trim().length < 10) return setErr("Enter a valid contact number.");

    // ✅ DB-Specific Validation based on selected role
    if (role === "student" && rollNumber.trim().length === 0) return setErr("Roll Number is required for students.");
    // This check will now only pass if 'designation' is filled out OR if we rely 
    // on the backend to provide a default value if 'designation' is empty.
    if ((role === "faculty" || role === "admin") && designation.trim().length === 0) return setErr("Designation/Title is required for staff/admin.");


    try {
      setLoading(true);
      
      // Map frontend role to database role (PascalCase)
      let dbRole = 'Student';
      if (role === 'faculty') dbRole = 'Faculty';
      if (role === 'admin') dbRole = 'Admin';

      // --- REFACTORED PAYLOAD CONSTRUCTION TO AVOID COMPLEX SPREAD SYNTAX ---
      const payload: Record<string, any> = {
          username,
          email,
          password: pwd,
          contact_no,
          role: dbRole, // ⚠️ Send 'Student', 'Faculty', or 'Admin' to the backend
      };

      // Department is required for Student and Faculty (Staff). Not Admin.
      if (role !== 'admin') {
          payload.departmentId = parseInt(departmentId);
      }
      
      // Conditional fields for STUDENT table
      if (role === "student") { 
          payload.rollNumber = rollNumber;
          payload.yearOfStudy = parseInt(yearOfStudy);
          payload.division = division;
      }
      
      // Conditional fields for FACULTY/ADMIN tables
      if (role === "faculty" || role === "admin") {
          payload.designation = designation;
      }
      // ---------------------------------------------------------------------------------------------------
      
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Use the pre-built payload object
      });


      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("role", data.user.role);
      localStorage.setItem("contact", data.user.contact);
      
      // Only store department if the role uses it
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

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-24" 
      style={{ backgroundImage: "url('/login_register_bg.jpeg')" }}
    >
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl border border-white/40">
        {/* Tabs (UI preserved) */}
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

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Username, Email, Password, Contact Number fields remain the same */}
          
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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={role}
              onChange={(e) => {
                const selectedRole = e.target.value;
                setRole(selectedRole);
                // Simple state reset when switching roles for clean form
                setRollNumber('');
                setYearOfStudy('1');
                setDivision('A');
                setDesignation('');
              }}
            >
              <option value="student">Student</option>
              <option value="faculty">Staff / Faculty</option>
              <option value="admin">Admin</option> 
            </select>
          </div>

        {/* Department (Conditional: Not required for Admin) */}
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
              {/* Values should be the DepartmentID (INT) from your DB */}
              <option value="1">INFT</option> 
              <option value="2">CMPN</option>
              <option value="3">EXCS</option>
              <option value="4">EXTC</option>
            </select>
          </div>
        )}
        
        {/* === STUDENT SPECIFIC FIELDS === */}
        {role === "student" && (
          <>
            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Unique College Roll Number"
              />
            </div>
            
            {/* Year of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year of Study
              </label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Final Year</option>
              </select>
            </div>
            
            {/* Division */}
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
        
        {/* === FACULTY/STAFF/ADMIN SPECIFIC FIELDS (Designation) === */}
        {role === "faculty" || role === "admin" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Designation/Title
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder={role === 'faculty' ? "e.g., Professor, Lab Assistant" : "e.g., System Administrator"}
            />
          </div>
        ) : null}


          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 font-medium shadow hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
