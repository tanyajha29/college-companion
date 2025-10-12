import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Type Definitions for API Data ---
type Department = {
    departmentid: number;
    departmentname: string;
};

type Session = {
    sessionid: number;
    subject_name: string;
    divisionname: string;
    day_of_week: string;
    start_time: string;
};

type StudentRosterItem = {
    studentid: number;
    rollnumber: string;
    username: string;
};

type AttendanceRecord = {
    [studentid: number]: 'Present' | 'Absent';
};

type StudentSummary = {
    subject_name: string;
    total_classes: number;
    classes_attended: number;
    percentage: string;
    isBelowThreshold: boolean;
};

// ===================================================================
// Main Page Component
// ===================================================================
export default function AttendancePage() {
    const role = localStorage.getItem("role") || "student";

    return (
        <div className="space-y-8 p-0 bg-gray-900 min-h-screen pt-10">
            <motion.header
                className="text-3xl font-extrabold text-cyan-400 border-b border-gray-700 pb-3 bg-gray-800 shadow-xl p-6 sticky top-0 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Attendance Tracker
            </motion.header>

            <div className="max-w-7xl mx-auto px-6">
                {role === "student" ? <StudentAttendanceSummary /> : <MarkAttendance />}
            </div>
        </div>
    );
}

// ===================================================================
// Staff/Admin View: For marking attendance
// ===================================================================
function MarkAttendance() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [students, setStudents] = useState<StudentRosterItem[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});

    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    // 1. Fetch departments on component mount
    useEffect(() => {
        axios.get('/api/attendance/departments', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setDepartments(res.data))
            .catch(err => console.error("Failed to fetch departments:", err));
    }, [token]);

    // 2. Fetch sessions when a department is selected
    useEffect(() => {
        if (selectedDepartment) {
            setIsLoading(true);
            setSessions([]); // Clear previous sessions
            setSelectedSession(''); // Reset session selection
            setStudents([]); // Clear students
            
            axios.get('/api/attendance/sessions', {
                headers: { Authorization: `Bearer ${token}` },
                params: { departmentId: selectedDepartment }
            })
            .then(res => setSessions(res.data))
            .catch(err => console.error("Failed to fetch sessions:", err))
            .finally(() => setIsLoading(false));
        }
    }, [selectedDepartment, token]);

    // 3. Fetch student roster when a session is selected
    useEffect(() => {
        if (selectedSession) {
            setIsLoading(true);
            axios.get(`/api/attendance/session-roster/${selectedSession}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setStudents(res.data);
                    const initialAttendance = res.data.reduce((acc: AttendanceRecord, student: StudentRosterItem) => {
                        acc[student.studentid] = 'Present';
                        return acc;
                    }, {});
                    setAttendance(initialAttendance);
                })
                .catch(err => console.error("Failed to fetch roster:", err))
                .finally(() => setIsLoading(false));
        }
    }, [selectedSession, token]);

    const handleStatusChange = (studentid: number, status: 'Present' | 'Absent') => {
        setAttendance(prev => ({ ...prev, [studentid]: status }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const records = Object.entries(attendance).map(([studentid, status]) => ({ studentid: parseInt(studentid), status }));
        const payload = { sessionId: selectedSession, date: attendanceDate, records };

        try {
            await axios.post('/api/attendance/mark', payload, { headers: { Authorization: `Bearer ${token}` } });
            alert('Attendance Submitted Successfully!');
        } catch (error) {
            console.error("Failed to submit attendance:", error);
            alert('Submission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 space-y-6">
                <h2 className="text-xl font-bold text-gray-100 border-b border-gray-700 pb-3">Mark Class Attendance</h2>
                
                {/* FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">Department</label>
                        <select 
                            onChange={(e) => setSelectedDepartment(e.target.value)} 
                            required 
                            className="p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg shadow-inner focus:border-cyan-500"
                        >
                            <option value="">-- Select Department --</option>
                            {departments.map(d => <option key={d.departmentid} value={d.departmentid}>{d.departmentname}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">Year</label>
                        <select 
                            onChange={(e) => setSelectedYear(e.target.value)} 
                            required 
                            className="p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg shadow-inner focus:border-cyan-500"
                        >
                            <option value="">-- Select Year --</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">Class Session</label>
                        <select 
                            onChange={(e) => setSelectedSession(e.target.value)} 
                            required 
                            disabled={!selectedDepartment || sessions.length === 0} 
                            className="p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg shadow-inner disabled:bg-gray-700 disabled:text-gray-500 focus:border-cyan-500"
                        >
                            <option value="">-- Select Session --</option>
                            {sessions.map(s => <option key={s.sessionid} value={s.sessionid}>{s.subject_name} (Div: {s.divisionname})</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:w-1/3">
                    <label className="text-sm font-medium text-gray-300 mb-1">Attendance Date</label>
                    <input 
                        type="date" 
                        value={attendanceDate} 
                        onChange={(e) => setAttendanceDate(e.target.value)} 
                        required 
                        className="p-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg shadow-inner focus:border-cyan-500" 
                    />
                </div>
                
                {isLoading && <p className="text-center text-cyan-400">Loading...</p>}
                
                <AnimatePresence>
                    {students.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-700 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map(student => (
                                    <div key={student.studentid} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700">
                                        <p className="font-medium text-gray-100">{student.username} ({student.rollnumber})</p>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => handleStatusChange(student.studentid, 'Present')} 
                                                className={`px-3 py-1 text-sm rounded-md transition ${attendance[student.studentid] === 'Present' ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                                            >
                                                Present
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleStatusChange(student.studentid, 'Absent')} 
                                                className={`px-3 py-1 text-sm rounded-md transition ${attendance[student.studentid] === 'Absent' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg shadow-xl text-white font-medium bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:text-gray-400 transition"
                            >
                                {isSubmitting ? 'Submitting...' : <><Save size={20} /> Submit Attendance</>}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
}

// ===================================================================
// Student View: Shows attendance summary
// ===================================================================
function StudentAttendanceSummary() {
    const [summary, setSummary] = useState<StudentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get('/api/attendance/my-summary', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setSummary(res.data))
            .catch(err => console.error("Failed to fetch summary:", err))
            .finally(() => setIsLoading(false));
    }, [token]);

    if (isLoading) return <p className="text-center text-xl text-cyan-400 py-10">Loading your attendance summary...</p>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">My Attendance Summary</h2>
            {summary.length === 0 ? (
                <div className="text-center py-12 text-xl text-gray-400 bg-gray-800 rounded-xl shadow-lg border border-dashed border-gray-700">
                    No attendance records found for you yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summary.map(subject => {
                        const isSafe = !subject.isBelowThreshold;
                        return (
                            <motion.div
                                key={subject.subject_name}
                                className={`p-5 rounded-xl shadow-xl border-b-4 bg-gray-800 ${isSafe ? 'border-green-600' : 'border-red-600'}`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-bold ${isSafe ? 'text-green-400' : 'text-red-400'}`}>{subject.subject_name}</h3>
                                    {isSafe ? <CheckCircle size={24} className="text-green-500" /> : <XCircle size={24} className="text-red-500" />}
                                </div>
                                <div className="w-full bg-gray-600 h-2 rounded-full mb-2">
                                    <motion.div
                                        className={`h-2 rounded-full ${isSafe ? "bg-green-500" : "bg-red-500"}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.percentage}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <p className={`text-sm font-bold ${isSafe ? 'text-green-400' : 'text-red-400'}`}>
                                    {subject.percentage}% Attendance ({subject.classes_attended}/{subject.total_classes})
                                </p>
                                {!isSafe && (
                                    <p className="text-red-400 font-semibold mt-2 text-xs p-2 bg-gray-900 rounded-md border border-red-600">
                                        ⚠️ Alert: Attendance is below the required threshold!
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}