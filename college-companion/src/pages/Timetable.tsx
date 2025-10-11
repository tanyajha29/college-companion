import React, { useState, useEffect } from "react";
import axios from "axios";
import { CalendarDays, Plus, Trash2, Edit, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimetableEntry = {
    timetable_id: number;
    day: string;
    starttime: string;
    endtime: string;
    subject: string;
    roomno: string;
    facultyid: number;
    division: string;
    courseid: number;
};

const departmentCourses: Record<string, { id: number; name: string }[]> = {
    INFT: [{ id: 101, name: "Mathematics" }, { id: 102, name: "DBMS" }, { id: 103, name: "Operating Systems" }, { id: 104, name: "Computer Networks" },],
    COMP: [{ id: 201, name: "Data Structures" }, { id: 202, name: "Algorithms" }, { id: 203, name: "Software Engg" },],
    EXTC: [{ id: 301, name: "Signal Processing" }, { id: 302, name: "Control Systems" }, { id: 303, name: "Analog Circuits" },],
    EXCS: [{ id: 401, name: "VLSI" }, { id: 402, name: "Communication Engg" },],
};
const divisions = ["A", "B", "C"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export default function Timetable() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState("INFT");

    const [form, setForm] = useState({
        day: days[0], // Default to Monday
        starttime: times[0],
        endtime: times[1],
        roomno: "",
        courseid: 0,
        facultyid: 0,
        division: divisions[0],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<'admin' | 'staff' | 'student' | null>(null);

    const canEdit = role === 'admin' || role === 'staff';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const [entriesRes] = await Promise.all([
                axios.get("/api/timetable", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setEntries(entriesRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const cleanRole = storedRole ? storedRole.toLowerCase().trim() : null;
        setRole(cleanRole as 'admin' | 'staff' | 'student' | null);

        if (cleanRole) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const openModal = (entry?: TimetableEntry) => {
        if (!canEdit) return;
        if (entry) {
            const department = Object.keys(departmentCourses).find(dept =>
                departmentCourses[dept].some(course => course.id === entry.courseid)
            ) || "INFT";
            setSelectedDepartment(department);
            setEditingEntry(entry);
            setForm({
                day: entry.day,
                starttime: entry.starttime,
                endtime: entry.endtime,
                roomno: entry.roomno,
                courseid: entry.courseid,
                facultyid: entry.facultyid,
                division: entry.division,
            });
        } else {
            const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            setEditingEntry(null);
            setForm({
                day: days.includes(currentDay) ? currentDay : days[0],
                starttime: times[0],
                endtime: times[1],
                roomno: "",
                courseid: departmentCourses[selectedDepartment][0]?.id || 0,
                facultyid: 0,
                division: divisions[0],
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.day || !form.starttime || !form.endtime || !form.roomno || !form.division || form.courseid <= 0 || form.facultyid <= 0) {
            alert("Please fill all required fields, including valid IDs.");
            return;
        }

        const payload = {
            dayofweek: form.day,
            starttime: `${form.starttime}:00`,
            endtime: `${form.endtime}:00`,
            roomno: form.roomno,
            courseid: Number(form.courseid),
            facultyid: Number(form.facultyid),
            div: form.division,
        };

        try {
            const token = localStorage.getItem("token");
            if (editingEntry) {
                await axios.put(`/api/timetable/${editingEntry.timetable_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post("/api/timetable", payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            setShowModal(false);
            await fetchData();
        } catch (err) {
            console.error("Failed to save session:", err);
            alert("An error occurred while saving.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!canEdit || !window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`/api/timetable/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            setEntries(prev => prev.filter(e => e.timetable_id !== id));
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const renderSessionSlot = (day: string, time: string) => {
        const entry = entries.find(e => e.day === day && e.starttime === time);
        if (!entry) return null;
        return (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center h-full flex flex-col justify-center">
                <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">{entry.subject}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{entry.roomno}</p>
                {canEdit && (
                    <div className="flex justify-center gap-2 mt-1">
                        <Edit size={14} className="cursor-pointer hover:text-green-500" onClick={() => openModal(entry)} />
                        <Trash2 size={14} className="cursor-pointer hover:text-red-500" onClick={() => handleDelete(entry.timetable_id)} />
                    </div>
                )}
            </div>
        );
    };

    if (!role) {
        return <div className="p-10 text-center">Please log in to view the timetable.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 sm:p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2 pt-12"><CalendarDays /> Timetable</h1>
                {canEdit && (
                    <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                        <Plus size={20} /> Add Session
                    </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2 border-b dark:border-gray-600 w-24 text-sm font-medium">Time</th>
                            {days.map(day => <th key={day} className="p-2 border-b dark:border-gray-600 text-sm font-medium">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={days.length + 1} className="text-center p-10">Loading...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={days.length + 1} className="text-center p-10 text-gray-500">
                                    No sessions found. Click "Add Session" to get started.
                                </td>
                            </tr>
                        ) : (
                            times.map(time => (
                                <tr key={time} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-2 border-t dark:border-gray-600 font-mono text-center text-xs">{time}</td>
                                    {days.map(day => (
                                        <td key={day} className="p-1 border dark:border-gray-700 h-24 w-40 align-top">
                                            {renderSessionSlot(day, time)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && canEdit && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-700" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                            <h2 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                                {editingEntry ? <Edit size={24} /> : <Plus size={24} />}
                                {editingEntry ? "Edit Session" : "Add New Session"}
                            </h2>

                            <div className="space-y-4">
                                
                                {/* ✅ FIX: Day of Week Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Day</label>
                                    <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                        {days.map(day => <option key={day} value={day}>{day}</option>)}
                                    </select>
                                </div>

                                {/* ✅ FIX: Start Time and End Time Dropdowns */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                                        <select value={form.starttime} onChange={e => setForm({ ...form, starttime: e.target.value })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                            {times.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                                        <select value={form.endtime} onChange={e => setForm({ ...form, endtime: e.target.value })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                            {times.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Department Dropdown */}
                                <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                    {Object.keys(departmentCourses).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>

                                {/* Dynamic Subject Dropdown */}
                                <select value={form.courseid} onChange={e => setForm({ ...form, courseid: parseInt(e.target.value) || 0 })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                    <option value={0} disabled>Select Subject</option>
                                    {departmentCourses[selectedDepartment].map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                                </select>

                                {/* Division Dropdown */}
                                <select value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                                    {divisions.map(div => <option key={div} value={div}>Division {div}</option>)}
                                </select>

                                {/* Room No Input */}
                                <input type="text" placeholder="Room No (e.g., L-101)" value={form.roomno} onChange={e => setForm({ ...form, roomno: e.target.value })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />

                                {/* Faculty ID Input */}
                                <input type="number" placeholder="Faculty ID" value={form.facultyid || ''} onChange={e => setForm({ ...form, facultyid: parseInt(e.target.value) || 0 })} className="w-full border-0 rounded-lg p-3 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="flex justify-end space-x-3 pt-6">
                                <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition flex items-center gap-2">
                                    <X size={20} /> Cancel
                                </button>
                                <button onClick={handleSave} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2">
                                    <Save size={20} /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
