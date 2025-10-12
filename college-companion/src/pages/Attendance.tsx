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

// CORRECTED: This type now uses 'p' | 'a'
type AttendanceRecord = {
    [studentid: number]: 'p' | 'a';
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
// Staff/Admin View: For marking attendance
// ===================================================================
// In src/pages/Attendance.tsx

function MarkAttendance() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [students, setStudents] = useState<StudentRosterItem[]>([]);
    // ✅ CHANGED: State now uses the exact capitalized words
    const [attendance, setAttendance] = useState<{[studentid: number]: 'Present' | 'Absent'}>({});

    // Filter states
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    // ... (useEffect hooks for fetching data do not need changes) ...
    useEffect(() => {
        axios.get('/api/attendance/departments', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setDepartments(res.data))
            .catch(err => console.error("Failed to fetch departments:", err));
    }, [token]);

    useEffect(() => {
        if (selectedDepartment) {
            setIsLoading(true);
            setSessions([]);
            setSelectedSession('');
            setStudents([]);
            axios.get('/api/attendance/sessions', {
                headers: { Authorization: `Bearer ${token}` },
                params: { departmentId: selectedDepartment }
            })
            .then(res => setSessions(res.data))
            .catch(err => console.error("Failed to fetch sessions:", err))
            .finally(() => setIsLoading(false));
        }
    }, [selectedDepartment, token]);

    useEffect(() => {
        if (selectedSession) {
            setIsLoading(true);
            axios.get(`/api/attendance/session-roster/${selectedSession}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setStudents(res.data);
                    // ✅ CHANGED: Default all students to 'Present'
                    const initialAttendance = res.data.reduce((acc: {[studentid: number]: 'Present' | 'Absent'}, student: StudentRosterItem) => {
                        acc[student.studentid] = 'Present';
                        return acc;
                    }, {});
                    setAttendance(initialAttendance);
                })
                .catch(err => console.error("Failed to fetch roster:", err))
                .finally(() => setIsLoading(false));
        }
    }, [selectedSession, token]);

    // ✅ CHANGED: Function now handles 'Present' and 'Absent'
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
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Mark Class Attendance</h2>
                
                {/* FILTERS (no changes) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select onChange={(e) => setSelectedDepartment(e.target.value)} required className="p-3 border bg-white rounded-lg shadow-sm">
                            <option value="">-- Select Department --</option>
                            {departments.map(d => <option key={d.departmentid} value={d.departmentid}>{d.departmentname}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select onChange={(e) => setSelectedYear(e.target.value)} required className="p-3 border bg-white rounded-lg shadow-sm">
                            <option value="">-- Select Year --</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Class Session</label>
                        <select onChange={(e) => setSelectedSession(e.target.value)} required disabled={!selectedDepartment} className="p-3 border bg-white rounded-lg shadow-sm disabled:bg-gray-100">
                            <option value="">-- Select Session --</option>
                            {sessions.map(s => <option key={s.sessionid} value={s.sessionid}>{s.subject_name} (Div: {s.divisionname})</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:w-1/3">
                    <label className="text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                    <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required className="p-3 border bg-white rounded-lg shadow-sm" />
                </div>
                
                {isLoading && <p className="text-center text-blue-600">Loading...</p>}
                
                <AnimatePresence>
                    {students.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map(student => (
                                    <div key={student.studentid} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                        <p className="font-medium">{student.username} ({student.rollnumber})</p>
                                        <div className="flex gap-2">
                                            {/* ✅ CHANGED: Buttons now use 'Present' and 'Absent' */}
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