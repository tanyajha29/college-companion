import { useState } from "react";

type Subject = {
  id: number;
  name: string;
  total: number;
  present: number;
};

// Subjects for each department
const departmentSubjects: Record<string, string[]> = {
  INFT: ["Mathematics", "DBMS", "Operating Systems", "Computer Networks"],
  CMPN: ["Mathematics", "Data Structures", "Algorithms", "Software Engg"],
  EXTC: ["Electronics", "Signal Processing", "Control Systems", "Analog Circuits"],
  ETRX: ["Electronics", "VLSI", "Communication Engg", "Control Systems"],
};

// Subject → Icon mapping
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
  VLSI: "/icons/vlsi.png",
};

// Color palette for cards
const subjectColors = [
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-pink-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-red-200",
];

export default function Attendance() {
  const [department, setDepartment] = useState("INFT");
  const [subjects, setSubjects] = useState<Subject[]>(
    departmentSubjects["INFT"].map((name, i) => ({
      id: i,
      name,
      total: 0,
      present: 0,
    }))
  );

  // Handle department change
  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    setSubjects(
      departmentSubjects[dept].map((name, i) => ({
        id: i,
        name,
        total: 0,
        present: 0,
      }))
    );
  };

  // Handle attendance update
  const handleAttendanceChange = (id: number, field: "total" | "present", value: number) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, [field]: Math.max(0, value) } : sub
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Manager</h1>

      {/* Department Dropdown */}
      <div className="mb-6">
        <label className="font-medium">Select Department: </label>
        <select
          value={department}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          className="ml-2 border p-2 rounded"
        >
          {Object.keys(departmentSubjects).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub, i) => {
          const percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;
          return (
            <div
              key={sub.id}
              className={`p-4 rounded-xl shadow-md ${subjectColors[i % subjectColors.length]}`}
            >
              <div className="flex items-center mb-3">
                <img
                  src={subjectIcons[sub.name] || "/icons/default.png"}
                  alt={sub.name}
                  className="w-10 h-10 object-contain mr-3"
                  onError={(e) => (e.currentTarget.src = "/icons/default.png")}
                />
                <h2 className="text-lg font-semibold">{sub.name}</h2>
              </div>

              {/* Attendance Inputs */}
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Total"
                  value={sub.total}
                  onChange={(e) =>
                    handleAttendanceChange(sub.id, "total", parseInt(e.target.value) || 0)
                  }
                  className="border p-2 w-1/2 rounded"
                />
                <input
                  type="number"
                  placeholder="Present"
                  value={sub.present}
                  onChange={(e) =>
                    handleAttendanceChange(sub.id, "present", parseInt(e.target.value) || 0)
                  }
                  className="border p-2 w-1/2 rounded"
                />
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-300 h-3 rounded">
                <div
                  className={`h-3 rounded ${percentage >= 75 ? "bg-green-600" : "bg-red-600"}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{percentage}% Attendance</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
