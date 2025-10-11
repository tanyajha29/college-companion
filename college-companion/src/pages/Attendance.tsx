import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, ChevronDown, Save, BookOpen, GraduationCap, Users, Calendar, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Type Definitions for API Data ---
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
// Main Page Component: Routes view based on user role
// ===================================================================
export default function AttendancePage() {
    const role = localStorage.getItem("role") || "student";

    return (
        <div className="space-y-8 p-0 bg-gray-50 min-h-screen pt-10">
            <motion.header
                className="text-3xl font-extrabold text-gray-900 border-b pb-3 bg-white shadow-sm p-6"
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
// Staff/Admin View: For marking attendance (REQ-4)
// ===================================================================
function MarkAttendance() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<StudentRosterItem[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    // 1. Fetch class sessions for the dropdown
    useEffect(() => {
        axios.get('/api/attendance/sessions', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setSessions(res.data))
            .catch(err => console.error("Failed to fetch sessions:", err));
    }, [token]);

    // 2. Fetch student roster when a session is selected
    useEffect(() => {
        if (selectedSession) {
            setIsLoading(true);
            axios.get(`/api/attendance/session-roster/${selectedSession}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setStudents(res.data);
                    // Default all students to 'Present' for convenience
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

    // 3. Submit attendance to the backend
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
            alert('Submission failed. Please check the console.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Mark Class Attendance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Session Select */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Class Session</label>
                        <select onChange={(e) => setSelectedSession(e.target.value)} required className="p-3 border bg-white rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="">-- Select a Session --</option>
                            {sessions.map(s => (
                                <option key={s.sessionid} value={s.sessionid}>
                                    {s.subject_name} (Div: {s.divisionname}) - {s.day_of_week}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Date Picker */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required className="p-3 border bg-white rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                {isLoading && <p className="text-center text-blue-600">Loading student list...</p>}
                
                <AnimatePresence>
                    {students.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map(student => (
                                    <div key={student.studentid} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                        <p className="font-medium">{student.username} ({student.rollnumber})</p>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleStatusChange(student.studentid, 'Present')} className={`px-3 py-1 text-sm rounded-md ${attendance[student.studentid] === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Present</button>
                                            <button type="button" onClick={() => handleStatusChange(student.studentid, 'Absent')} className={`px-3 py-1 text-sm rounded-md ${attendance[student.studentid] === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Absent</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" disabled={isSubmitting} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg shadow-md text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
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
// Student View: Shows attendance summary (REQ-5 & REQ-6)
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

    if (isLoading) return <p className="text-center text-xl text-blue-600 py-10">Loading your attendance summary...</p>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Attendance Summary</h2>
            {summary.length === 0 ? (
                <div className="text-center py-12 text-xl text-gray-500 bg-white rounded-xl shadow-lg border border-dashed">
                    No attendance records found for you yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summary.map(subject => {
                        const isSafe = !subject.isBelowThreshold;
                        return (
                            <motion.div
                                key={subject.subject_name}
                                className={`p-5 rounded-xl shadow-lg border-b-4 ${isSafe ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-bold ${isSafe ? 'text-green-900' : 'text-red-900'}`}>{subject.subject_name}</h3>
                                    {isSafe ? <CheckCircle size={24} className="text-green-500" /> : <XCircle size={24} className="text-red-500" />}
                                </div>
                                <div className="w-full bg-gray-300 h-2 rounded-full mb-2">
                                    <motion.div
                                        className={`h-2 rounded-full ${isSafe ? "bg-green-600" : "bg-red-600"}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.percentage}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <p className={`text-sm font-bold ${isSafe ? 'text-green-800' : 'text-red-800'}`}>
                                    {subject.percentage}% Attendance ({subject.classes_attended}/{subject.total_classes})
                                </p>
                                {!isSafe && (
                                    <p className="text-red-700 font-semibold mt-2 text-xs">
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