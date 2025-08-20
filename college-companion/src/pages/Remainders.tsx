import { useState } from "react";

type Reminder = {
  id: number;
  title: string;
  date: string;
  note?: string;
};

export default function Reminder() {
  const role = localStorage.getItem("role") || "student";
  const isEditable = role === "staff" || role === "admin";

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ title: "", date: "", note: "" });

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    setReminders([...reminders, { id: Date.now(), ...form }]);
    setForm({ title: "", date: "", note: "" });
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">⏰ Reminders</h1>

      {/* Add form only for Staff/Admin */}
      {isEditable && (
        <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg max-w-md mx-auto mb-8">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Add Reminder</h2>
          <form onSubmit={addReminder} className="grid gap-3">
            <input
              placeholder="Title"
              className="border rounded-lg p-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="date"
              className="border rounded-lg p-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <textarea
              placeholder="Notes (optional)"
              className="border rounded-lg p-2"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              ➕ Add Reminder
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="max-w-3xl mx-auto grid gap-4">
        {reminders.length === 0 ? (
          <p className="text-center text-gray-200">No reminders yet.</p>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="bg-white text-gray-900 p-4 rounded-lg shadow flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-blue-700">{r.title}</h3>
                <p className="text-sm text-gray-600">📅 {r.date}</p>
                {r.note && <p className="text-sm italic">{r.note}</p>}
              </div>
              {isEditable && (
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
