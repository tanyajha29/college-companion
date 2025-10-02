import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronDown, Save, BookOpen, GraduationCap, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Subject = {
  id: number;
  name: string;
  total: number;
  present: number;
};

// --- Mock Data & Configuration ---

// Subjects for each department
const departmentSubjects: Record<string, string[]> = {
  INFT: ["Mathematics", "DBMS", "Operating Systems", "Computer Networks"],
  COMP: ["Mathematics", "Data Structures", "Algorithms", "Software Engg"],
  EXTC: ["Electronics", "Signal Processing", "Control Systems", "Analog Circuits"],
  EXCS: ["Electronics", "VLSI", "Communication Engg", "Control Systems"],
};

// Subject → Icon mapping (Ensure these paths exist in your /public/icons folder)
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

// Mock Subjects for dynamic generation (Replace with API call)
const getInitialSubjects = (dept: string): Subject[] => {
  const subjects = departmentSubjects[dept] || departmentSubjects["INFT"];
  return subjects.map((name, i) => ({
    id: i,
    name,
    total: 20 + i * 5, 
    present: 15 + i * 4,
  }));
};

const filterOptions = {
    departments: Object.keys(departmentSubjects),
    years: ["1st", "2nd", "3rd", "4th"],
    divs: ["A", "B", "C"],
};

// OPTION 1: Modern Neutral & Earthy Palette

const subjectCardStyles = [
  // Theme 1: Primary Blue (Consistent Accent)
  { bg: "bg-blue-50", border: "border-blue-700", text: "text-blue-900", highlight: "bg-blue-200" },
  // Theme 2: Deep Teal/Emerald
  { bg: "bg-emerald-50", border: "border-emerald-700", text: "text-emerald-900", highlight: "bg-emerald-200" },
  // Theme 3: Warm Sand/Brown
  { bg: "bg-amber-50", border: "border-amber-700", text: "text-amber-900", highlight: "bg-amber-200" },
  // Theme 4: Muted Lilac/Violet
  { bg: "bg-violet-50", border: "border-violet-700", text: "text-violet-900", highlight: "bg-violet-200" },
  // Theme 5: Subtle Cool Gray
  { bg: "bg-gray-100", border: "border-gray-600", text: "text-gray-800", highlight: "bg-gray-300" },
];

// --- Main Component ---

export default function Attendance() {
  const role = localStorage.getItem("role") || "student";
  const isEditable = role === "staff";
  
  // Set initial state based on a student's (mock) context
  const studentDept = role === 'student' ? 'INFT' : 'INFT'; 

  const [department, setDepartment] = useState(studentDept);
  const [year, setYear] = useState(filterOptions.years[0]);
  const [div, setDiv] = useState(filterOptions.divs[0]);
  const [subjects, setSubjects] = useState<Subject[]>(getInitialSubjects(studentDept));
  const [isSaving, setIsSaving] = useState(false);

  // Data Fetching Simulation
  useEffect(() => {
    // 💡 Replace this with your actual API fetch call later
    setSubjects([]); // Clear subjects to show loading state
    const timer = setTimeout(() => {
        setSubjects(getInitialSubjects(department));
    }, 500); // Simulate API call delay
    return () => clearTimeout(timer);
  }, [department, year, div]);


  // Handle attendance update (for Staff)
  const handleAttendanceChange = (id: number, field: "total" | "present", value: number) => {
    if (!isEditable) return; 
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
            let total = sub.total;
            let present = sub.present;

            if (field === 'total') {
                total = Math.max(0, value);
                if (present > total) present = total; 
            } else {
                present = Math.max(0, value);
                if (present > total) present = total;
            }
            return { ...sub, total, present };
        }
        return sub;
      })
    );
  };
    
  // Handle data saving (Mock Save)
  const handleSave = async () => {
    setIsSaving(true);
    // 🔑 Send PUT/PATCH request to API here
    console.log("Saving attendance data:", subjects);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsSaving(false);
    alert(`Attendance data saved for ${department}, ${year}, Div ${div}.`);
  };

  // Render Utility Component
  const FilterSelect = ({ label, value, options, onChange, disabled, icon: Icon }: { label: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean, icon: React.ElementType }) => (
    <div className="flex flex-col flex-grow">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`appearance-none border ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white hover:border-blue-500'} p-3 pl-10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-full`}
                disabled={disabled}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            <Icon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    </div>
  );

  return (
    
    
    <div className="space-y-8 p-0 bg-gray-50 pt-16">
      <motion.h1 
        className="text-3xl font-extrabold text-gray-900 border-b pb-3 mb-6 p-6 bg-white shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Attendance Manager {role !== 'student' ? `(${role.toUpperCase()})` : ''}
      </motion.h1>

      {/* --- Filter Section --- */}
      <motion.div 
        className="flex flex-wrap items-end gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <FilterSelect 
          label="Department"
          value={department}
          options={filterOptions.departments}
          onChange={setDepartment}
          disabled={!isEditable && role !== 'admin'} 
          icon={GraduationCap}
        />
        <FilterSelect 
          label="Year"
          value={year}
          options={filterOptions.years}
          onChange={setYear}
          disabled={!isEditable && role !== 'admin'}
          icon={BookOpen}
        />
        <FilterSelect 
          label="Division"
          value={div}
          options={filterOptions.divs}
          onChange={setDiv}
          disabled={!isEditable && role !== 'admin'}
          icon={Users}
        />
        
        {isEditable && (
            <motion.button
                onClick={handleSave}
                className={`mt-6 ml-auto flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition duration-200 
                            ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white font-medium'}`}
                whileHover={isSaving ? {} : { scale: 1.05 }}
                whileTap={isSaving ? {} : { scale: 0.95 }}
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <Save size={20} />
                        </motion.span> 
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={20} /> Save Changes
                    </>
                )}
            </motion.button>
        )}
      </motion.div>

      {/* --- Subject Cards --- */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <AnimatePresence>
            {subjects.length === 0 && (
                 <motion.div 
                    key="loading"
                    className="col-span-full text-center py-12 text-xl text-gray-500 bg-white rounded-xl shadow-lg border border-dashed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                 >
                    <div className="flex justify-center items-center gap-2 mb-3 text-blue-500">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <BookOpen size={30} />
                        </motion.div>
                        <span className="font-semibold">Loading attendance data...</span>
                    </div>
                 </motion.div>
            )}
            {subjects.map((sub, i) => {
              const percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;
              const isSafe = percentage >= 75;
              const statusColorClass = isSafe ? "text-green-700" : "text-red-700";
              const cardStyle = subjectCardStyles[i % subjectCardStyles.length];
              
              return (
                <motion.div
                  key={sub.id}
                  className={`p-5 rounded-xl shadow-lg border-b-4 border-r-2 transition duration-300 hover:shadow-xl ${cardStyle.bg} ${cardStyle.border}`}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <img
                            src={subjectIcons[sub.name] || "/icons/default.png"}
                            alt={sub.name}
                            className="w-10 h-10 object-contain mr-3 rounded-full p-1 bg-white shadow-sm"
                            onError={(e) => (e.currentTarget.src = "/icons/default.png")}
                        />
                        <h2 className={`text-lg font-bold ${cardStyle.text}`}>{sub.name}</h2>
                    </div>
                    {isSafe ? (
                        <CheckCircle size={20} className="text-green-500" title="Attendance Safe" />
                    ) : (
                        <XCircle size={20} className="text-red-500" title="Low Attendance Risk" />
                    )}
                  </div>

                  {/* Attendance Inputs (staff edit/view, others view only) */}
                  <div className="flex gap-4 mb-4 items-center">
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-600">Total Classes</label>
                        <input
                            type="number"
                            value={sub.total}
                            onChange={(e) => handleAttendanceChange(sub.id, "total", parseInt(e.target.value) || 0)}
                            className={`border ${isEditable ? 'border-gray-300' : 'border-dashed border-gray-200'} p-2 w-full rounded-lg text-sm font-semibold ${!isEditable ? 'bg-gray-50 text-gray-700' : ''} focus:ring-blue-500 focus:border-blue-500 transition`}
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-600">Classes Present</label>
                        <input
                            type="number"
                            value={sub.present}
                            onChange={(e) => handleAttendanceChange(sub.id, "present", parseInt(e.target.value) || 0)}
                            className={`border ${isEditable ? 'border-gray-300' : 'border-dashed border-gray-200'} p-2 w-full rounded-lg text-sm font-semibold ${!isEditable ? 'bg-gray-50 text-gray-700' : ''} focus:ring-blue-500 focus:border-blue-500 transition`}
                            disabled={!isEditable}
                        />
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="w-full bg-gray-300 h-2 rounded-full mt-2">
                    <motion.div
                      className={`h-2 rounded-full ${isSafe ? "bg-green-600" : "bg-red-600"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5 }}
                    ></motion.div>
                  </div>
                  <p className={`text-sm mt-2 font-bold ${statusColorClass}`}>
                    {percentage}% Attendance ({sub.present}/{sub.total})
                  </p>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>
      
      {subjects.length === 0 && !isSaving && ( 
          <motion.div 
            key="no-data"
            className="col-span-full text-center py-12 text-xl text-gray-500 bg-white rounded-xl shadow-lg border border-dashed p-6 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
              No attendance data found for the selected filters.
          </motion.div>
      )}
    </div>
  );
}