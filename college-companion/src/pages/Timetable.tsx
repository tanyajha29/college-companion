import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Clock, CalendarDays, Plus, Trash2, Edit, X, Save, AlertTriangle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimetableEntry = {
  timetable_id: number;
  user_id: number;
  day: string;
  time: string;
  subject: string;
  location: string;
};

// --- CONSTANTS ---
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"];

export default function Timetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState({ day: "", time: "", subject: "", location: "" });
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔑 NEW: Role and Filter States
  const [role, setRole] = useState<'admin' | 'staff' | 'student' | null>(null);
  const [filters, setFilters] = useState({ department: "INFT", division: "A" });

  // Access Control Checks
  const isAdminOrStaff = role === 'admin' || role === 'staff';
  const canEdit = isAdminOrStaff; // Only Admin/Staff can add/edit/delete

  const userId = 1; // 🔑 Replace with logged-in user_id from auth later

  // 1. Initial Load and Role Check
  useEffect(() => {
    const storedRole = localStorage.getItem("role") as 'admin' | 'staff' | 'student' | null;
    setRole(storedRole);

    const fetchData = () => {
        console.log("Fetching timetable..."); 
        setIsLoading(true);
        axios
        .get("http://localhost:5000/api/timetable", {
          // You might adjust the API call here later to pass department/division filters
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then((res) => {
          console.log("✅ Response:", res.data);
          setEntries(res.data);
          setIsLoading(false);
          
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          if(days.includes(currentDay)) {
              setSelectedDay(currentDay);
          }
        })
        .catch((err) => {
            console.error(err);
            setIsLoading(false);
        });
    };
    if (storedRole) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);
  // NOTE: If you implement filtering on the backend, you would add filters to the dependency array.

  // The rest of the logic remains unchanged:
  const hasConflict = (day: string, time: string, id?: number) => {
    return entries.some(
      (entry) => 
        entry.day === day && 
      entry.time.slice(0,5) === time.slice(0,5) && 
      entry.timetable_id !== id
    );
  };

  const openModal = (entry?: TimetableEntry) => {
    if (!canEdit && entry) return; // Prevent student from opening edit modal
    if (!canEdit && !entry) return; // Prevent student from opening add modal

    if (entry) {
      setEditingEntry(entry);
      setForm({
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
        location: entry.location || "",
      });
    } else {
      setEditingEntry(null);
      setForm({ day: selectedDay, time: times[0], subject: "", location: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.day || !form.time || !form.subject) return;

    if (hasConflict(form.day, form.time, editingEntry?.timetable_id)) {
        alert("Conflict: A session already exists at this time slot.");
        return;
    }

    if (editingEntry) {
      try {
        await axios.put(
          `http://localhost:5000/api/timetable/${editingEntry.timetable_id}`,
          form,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        setEntries((prev) =>
          prev.map((e) =>
            e.timetable_id === editingEntry.timetable_id ? { ...e, ...form } : e
          )
        );
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await axios.post("http://localhost:5000/api/timetable", {...form, user_id: userId}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        setEntries((prev) => [...prev, res.data]);
      } catch (err) {
        console.error(err);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!canEdit) return; // Prevent non-authorized deletion
    if(!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEntries((prev) => prev.filter((e) => e.timetable_id !== id));
    } catch (err) {
      console.error(err);
    }
  };
    
  // Function to render the session slot content (Modified for RBAC)
  const renderSessionSlot = (day: string, time: string) => {
    const entry = entries.find((e) => e.day === day && e.time.slice(0,5) === time.slice(0,5));
    const conflict = hasConflict(day, time, entry?.timetable_id);

    const baseClasses = "rounded-lg p-3 h-full w-full flex flex-col justify-center items-center text-center transition duration-200 ease-in-out";
    
    // Only Admin/Staff can interact with empty slots
    const emptyClasses = canEdit 
        ? "border-2 border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
        : "border-2 border-dashed border-gray-100 dark:border-gray-800 cursor-default";

    const sessionClasses = `bg-white dark:bg-gray-700 shadow-md hover:shadow-lg border border-transparent 
        ${canEdit ? "hover:border-blue-500 cursor-pointer" : "cursor-default"}
        ${conflict && canEdit ? "border-red-500 ring-2 ring-red-300" : ""}`;

    if (entry) {
        return (
            <motion.div 
                key={entry.timetable_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={canEdit ? { scale: 1.02 } : {}} // Hover effect only for Admin/Staff
                className={`${baseClasses} ${sessionClasses}`}
                onClick={() => canEdit ? openModal(entry) : null} // Allow edit only if Admin/Staff
            >
                <div className="font-extrabold text-blue-600 dark:text-blue-400 text-lg leading-tight">
                    {entry.subject}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-semibold">{entry.location}</span>
                </div>
                {conflict && canEdit && ( // Only show conflict warning to staff/admin
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12}/> CONFLICT
                    </div>
                )}
                {/* Delete button (only visible and functional for Admin/Staff) */}
                {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.timetable_id);
                  }}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-2 p-1 rounded-full hover:bg-red-50/50 transition"
                >
                  <Trash2 size={16} />
                </button>
                )}
            </motion.div>
        );
    }

    // Empty slot (clickable only if Admin/Staff)
    return (
        <motion.div 
            className={`${baseClasses} ${emptyClasses}`} 
            onClick={() => canEdit ? openModal() : null}
            whileHover={canEdit ? { scale: 1.02 } : {}}
        >
            {canEdit ? (
                <Plus size={20} className="text-gray-500 dark:text-gray-400" />
            ) : (
                <span className="text-gray-400 text-sm">-</span>
            )}
        </motion.div>
    );
  };
  
  // Handle unauthorized/loading states outside the main return
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-10">
        <Clock size={32} className="text-blue-500 animate-spin mb-4" />
        <p className="text-xl text-gray-600 dark:text-gray-400 ml-4">Loading your timetable...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-10 text-red-600 dark:text-red-400">
        Authentication Error: Please log in to view the timetable.
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 p-6 sm:p-10">
      
      <header className="max-w-7xl mx-auto mb-8">
        {/* Centered Heading */}
        <h1 className="justify-center text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-500 flex items-center gap-3 pt-12 ">
          <CalendarDays size={38} /> Weekly Timetable
        </h1>
        
       
          <p className="text-center text-lg text-gray-600 dark:text-gray-400">
            {canEdit ? "Manage your class schedule. Click on a slot to add or edit." : "View your current class schedule."}
          </p>
          
<div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        
          {/* 🎯 NEW: Department/Division Filters (Admin/Staff only) */}
          {isAdminOrStaff && (
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Viewing:</span>
              
              <select
                className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="INFT">INFT</option>
                <option value="COMP">COMP</option>
              </select>
              
              <select
                className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                value={filters.division}
                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
              </select>
            </div>
          )}
        </div>

        {/* Add New Session Button (Admin/Staff only) */}
        {canEdit && (
          <button
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-200 shadow-md flex items-center gap-2"
            onClick={() => openModal()}
          >
            <Plus size={20} /> Add New Session
          </button>
        )}
      </header>

      <div className="overflow-x-auto max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6">
        
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left w-1/12 text-sm font-bold text-gray-500 dark:text-gray-300 border-b dark:border-gray-700">
                Time
              </th>
              {days.map((day) => (
                <th 
                    key={day} 
                    className={`p-3 text-center text-sm font-bold border-b dark:border-gray-700 
                        ${day === selectedDay ? "text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg" : "text-gray-500 dark:text-gray-300"}`
                    }
                    onClick={() => setSelectedDay(day)}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time} className="h-20">
                <td className="p-2 border-r dark:border-gray-700 text-sm font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-l-lg">
                  {time.slice(0, 5)}
                </td>
                {days.map((day) => {
                  return (
                    <td
                      key={day + time}
                      className="p-1 h-full align-middle transition duration-150"
                    >
                      {renderSessionSlot(day, time)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (Unchanged) */}
      <AnimatePresence>
        {showModal && canEdit && ( // Modal only shows if canEdit is true
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <h2 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                {editingEntry ? <Edit size={24} /> : <Plus size={24} />} 
                {editingEntry ? "Edit Session" : "Add New Session"}
              </h2>

              <div className="space-y-4">
                <select
                  className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:border-gray-600"
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:border-gray-600"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                >
                  <option value="">Select Time</option>
                  {times.map((t) => (
                    <option key={t} value={t}>
                      {t.slice(0, 5)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Subject Name (e.g., Web Dev, DBMS)"
                  className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:border-gray-600"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />

                <input
                  type="text"
                  placeholder="Location (e.g., L-101, C-Lab 3)"
                  className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:border-gray-600"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  className="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 flex items-center gap-2"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} /> Cancel
                </button>
                
                <button
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  onClick={handleSave}
                >
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