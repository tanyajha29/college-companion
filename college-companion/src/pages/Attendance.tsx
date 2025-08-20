import { useState, useEffect } from "react";

type Subject = {
  id: number;
  name: string;
  total: number;
  present: number;
};
// Subject Icon Mapping
const subjectIcons: Record<string, string> = {
  Mathematics: "/icons/mathematics.png",
  DBMS: "/icons/dbms.png",
  "Operating Systems": "/icons/operatingsystems.png",
  "Computer Networks": "/icons/computernetworks.png",
  "Data Structures": "/icons/datastructures.png",
  Algorithms: "/icons/algorithms.png",
  "Software Engg": "/icons/softwareengineering.png",
  Electronics: "/icons/electronics.png",
  "Signal Processing": "/icons/signalprocessing.png",
  "Control Systems": "/icons/controlsystems.png",
  "Analog Circuits": "/icons/analogcircuits.png",
  "Communication Engg": "/icons/communicationEngg.png",
  VLSI: "/icons/VLSI.png",
};

// Subjects for each department
const departmentSubjects: Record<string, string[]> = {
  INFT: ["Mathematics", "DBMS", "Operating Systems", "Computer Networks"],
  CMPN: ["Mathematics", "Data Structures", "Algorithms", "Software Engineering"],
  EXCS: ["Mathematics", "Electronics", "Signal Processing", "Control Systems"],
  EXTC: ["Mathematics", "Analog Circuits", "Communication Engineering", "VLSI"],
};

export default function Attendance() {
  const role = localStorage.getItem("role") || "student"; // role check
  const isEditable = role === "staff" || role === "admin";

  // ✅ Department comes from localStorage (set at login/registration)
  const storedDept = localStorage.getItem("department") || "INFT";
  const [department, setDepartment] = useState(storedDept);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  // load subjects when page opens OR department changes
  useEffect(() => {
    setSubjects(
      departmentSubjects[department].map((name, i) => ({
        id: i + 1,
        name,
        total: 0,
        present: 0,
      }))
    );
  }, [department]);

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    localStorage.setItem("department", dept); // save for persistence
  };

  const markAttendance = (id: number, status: "present" | "absent") => {
    if (!isEditable) return; // students can't edit
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const total = sub.total + 1;
          const present = status === "present" ? sub.present + 1 : sub.present;
          return { ...sub, total, present };
        }
        return sub;
      })
    );
  };

  return (
    <div className="pt-20 px-6 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <h1 className="text-3xl font-bold text-white mb-6 text-center"> Attendance Tracker</h1>

      {/* Department Selector (only staff/admin can change) */}
      <div className="mb-6">
        <label className="text-white font-medium mr-3">Department:</label>
        <select
          className="p-2 rounded-lg"
          value={department}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          disabled={role === "student"} // Students can't switch dept
        >
          <option value="INFT">INFT</option>
          <option value="CMPN">CMPN</option>
          <option value="EXCS">EXCS</option>
          <option value="EXTC">EXTC</option>
        </select>
      </div>

      {/* Subject Cards */}
      <div className="grid gap-6">
        {subjects.map((sub) => {
          const percentage =
            sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;
          const belowThreshold = percentage < 75 && sub.total > 0;

          return (
            <div
              key={sub.id}
              className="p-6 bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between gap-4"
            >
              {/* Subject Info */}
              <div className="flex items-center gap-3">
  {/* Subject Icon */}
  <img
   
  src={subjectIcons[sub.name] || "/icons/default.png"}
  alt={sub.name}
  className="w-10 h-10 object-contain"

    onError={(e) => (e.currentTarget.src = "/icons/default.png")}
/>

  {/* Subject Info */}
  <div>
    <h2 className="text-lg font-semibold">{sub.name}</h2>
    <p className="text-sm text-gray-600">
      {sub.present}/{sub.total} classes attended
    </p>
  </div>
</div>


              {/* Percentage */}
              <div
                className={`font-bold ${
                  belowThreshold ? "text-red-600" : "text-green-600"
                }`}
              >
                {percentage}%
              </div>

              {/* Buttons only for Staff/Admin */}
              {isEditable && (
                <div className="flex gap-2">
                  <button
                    onClick={() => markAttendance(sub.id, "present")}
                    className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(sub.id, "absent")}
                    className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    Absent
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
