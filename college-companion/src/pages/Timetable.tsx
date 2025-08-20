import { useState } from "react";

type ClassEntry = {
  id: number;
  subject: string;
  day: string;
  start: string;
  end: string;
  room?: string;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`); // 8AM–6PM

export default function Timetable() {
  const role = localStorage.getItem("role") || "Student"; // default Student
  const isEditable = role === "Staff" || role === "Admin";

  const [entries, setEntries] = useState<ClassEntry[]>([]);
  const [form, setForm] = useState({
    subject: "",
    day: "Monday",
    start: "08:00",
    end: "09:00",
    room: "",
  });
  const [error, setError] = useState<string | null>(null);

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.subject.trim()) return setError("Subject required.");
    if (form.start >= form.end)
      return setError("Start time must be before end time.");

    const overlap = entries.some(
      (c) =>
        c.day === form.day &&
        ((form.start >= c.start && form.start < c.end) ||
          (form.end > c.start && form.end <= c.end))
    );
    if (overlap) return setError("Time overlaps with existing class.");

    setEntries([...entries, { id: Date.now(), ...form }]);
    setForm({
      subject: "",
      day: "Monday",
      start: "08:00",
      end: "09:00",
      room: "",
    });
  };

  const deleteClass = (id: number) => {
    setEntries(entries.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-24">
      <h1 className="text-4xl font-bold text-white text-center mb-10 drop-shadow">
        📅 Weekly Timetable
      </h1>

      {/* Show form only if Staff/Admin */}
      {isEditable && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
            Add a Class
          </h2>
          <form
            onSubmit={addClass}
            className="grid gap-4 md:grid-cols-5 items-center"
          >
            <input
              placeholder="Subject"
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <select
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
            >
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input
              type="time"
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            <input
              type="time"
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
            <input
              placeholder="Room"
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
            <button
              type="submit"
              className="col-span-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
            >
              ➕ Add Class
            </button>
          </form>
          {error && (
            <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid bg-white rounded-2xl shadow-lg overflow-hidden"
          style={{ gridTemplateColumns: `120px repeat(${days.length}, 1fr)` }}
        >
          {/* Header Row */}
          <div className="border p-3 font-bold text-blue-700 bg-blue-100">
            Time
          </div>
          {days.map((d) => (
            <div
              key={d}
              className="border p-3 font-bold text-center text-blue-700 bg-blue-100"
            >
              {d}
            </div>
          ))}

          {/* Time slots */}
          {times.map((t, i) => (
            <>
              <div
                key={t}
                className={`border p-3 text-sm font-medium ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                {t}
              </div>
              {days.map((d) => (
                <div
                  key={d + t}
                  className={`border relative h-20 ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  } hover:bg-blue-50 transition`}
                >
                  {entries
                    .filter((c) => c.day === d && c.start === t)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="absolute inset-1 bg-gradient-to-r from-blue-200 to-blue-300 border-l-4 border-blue-600 p-2 text-xs rounded-lg shadow-md flex justify-between items-start"
                      >
                        <div>
                          <strong className="block text-blue-900">
                            {c.subject}
                          </strong>
                          <div className="text-gray-700 text-xs">
                            {c.start} - {c.end}
                          </div>
                          {c.room && (
                            <div className="italic text-gray-600 text-xs">
                              Room {c.room}
                            </div>
                          )}
                        </div>

                        {/* Delete button (Staff/Admin only) */}
                        {isEditable && (
                          <button
                            onClick={() => deleteClass(c.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
