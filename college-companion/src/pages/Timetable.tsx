import React, { useState, useEffect } from "react";
import axios from "axios";

type TimetableEntry = {
  timetable_id: number;
  user_id: number;
  day: string;
  time: string;
  subject: string;
  location: string;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"];

export default function Timetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState({ day: "", time: "", subject: "", location: "" });

  const userId = 1; // 🔑 Replace with logged-in user_id from auth later

  // ✅ Fetch timetable from backend
  useEffect(() => {
    console.log("Fetching timetable..."); 
  axios
    .get("http://localhost:5000/api/timetable", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then((res) => 
      console.log("✅ Response:", res.data);
    setEntries(res.data))
    .catch((err) => console.error(err));
}, []);

  // ✅ Check for conflicts
  const hasConflict = (day: string, time: string, id?: number) => {
    return entries.some(
      (entry) => 
        entry.day === day && 
      entry.time.slice(0,5) === time.slice(0,5) && 
      entry.timetable_id !== id
    );
  };

  const openModal = (entry?: TimetableEntry) => {
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
      setForm({ day: "", time: "", subject: "", location: "" });
    }
    setShowModal(true);
  };

  // ✅ Save (Create/Update)
  const handleSave = async () => {
    if (!form.day || !form.time || !form.subject) return;

    if (editingEntry) {
      // Update
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
      // Create
      try {
        const res = await axios.post("http://localhost:5000/api/timetable", form, {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

        setEntries((prev) => [...prev, res.data]); // backend returns created row
      } catch (err) {
        console.error(err);
      }
    }
    setShowModal(false);
  };

  // ✅ Delete
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

      setEntries((prev) => prev.filter((e) => e.timetable_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weekly Timetable</h1>
      <button
        className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
        onClick={() => openModal()}
      >
        + Add Session
      </button>

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Time</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                  {time.slice(0, 5)} {/* Show 09:00 instead of 09:00:00 */}
                </td>
                {days.map((day) => {
                  const entry = entries.find((e) => e.day === day && e.time.slice(0,5) === time.slice(0,5));
                  const conflict = hasConflict(day, time, entry?.timetable_id);

                  return (
                    <td
                      key={day + time}
                      className={`border border-gray-300 p-2 align-top cursor-pointer ${
                        conflict ? "bg-red-100 border-red-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => openModal(entry || undefined)}
                    >
                      {entry ? (
                        <div>
                          <div className="font-semibold">{entry.subject}</div>
                          <div className="text-sm text-gray-600">{entry.location}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entry.timetable_id);
                            }}
                            className="text-xs text-red-500 mt-1"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">+</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {editingEntry ? "Edit Session" : "Add Session"}
            </h2>
            <div className="space-y-3">
              <select
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
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
                placeholder="Subject"
                className="w-full border p-2 rounded"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />

              <input
                type="text"
                placeholder="Location"
                className="w-full border p-2 rounded"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
