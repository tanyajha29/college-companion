import { useState, useEffect } from "react";
import axios from "axios";
// Import Lucide icons if needed for a proper component structure.

// --- TYPE DEFINITIONS ---
type Department = "ALL" | "INFT" | "COMP" | "EXTC" | "EXCS";
type Division = "ALL" | "A" | "B" | "C";

type Reminder = {
  id: number;
  title: string;
  date: string;
  note?: string;
  department: Department;
  division: Division;
};

// --- REAL DATABASE & AUTH UTILS ---

/**
 * Utility to fetch the current user's details from storage/context.
 */
const getCurrentUser = () => {
  const role = localStorage.getItem("role") || "student";
  // Ensure department and division are correctly cast/typed for use in the API params
  const department = (localStorage.getItem("department") as Department) || "INFT";
  const division = (localStorage.getItem("division") as Division) || "A";
  return { role, department, division };
};

/**
 * 🌟 REAL DATABASE CALL: Fetches reminders from the backend API.
 * The filtering logic must be on the server at http://localhost:5000/api/reminders.
 */
const fetchRemindersFromDB = async (): Promise<Reminder[]> => {
  const user = getCurrentUser();
  const token = localStorage.getItem("token");

  // Pass user context as query parameters for the server to filter
  const params = {
    role: user.role,
    department: user.department,
    division: user.division,
  };

  try {
    const response = await axios.get<Reminder[]>("http://localhost:5000/api/reminders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params, // Sends: ?role=...&department=...
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reminders from API:", error);
    throw error;
  }
};

/**
 * 🌟 REAL DATABASE CALL: Saves a new reminder via the backend API.
 */
const saveReminderToDB = async (reminder: Omit<Reminder, "id">): Promise<Reminder> => {
  const token = localStorage.getItem("token");
  try {
    // Send the reminder data to the POST endpoint
    const response = await axios.post<Reminder>("http://localhost:5000/api/reminders", reminder, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // The server must return the new reminder object including the DB-generated ID
    return response.data;
  } catch (error) {
    console.error("Error saving reminder to API:", error);
    throw error;
  }
};

// --- REMINDER COMPONENT ---

export default function ReminderComponent() {
  const user = getCurrentUser();
  const isEditable = user.role === "staff" || user.role === "admin";

  const initialFormState = {
    title: "",
    date: "",
    note: "",
    department: "ALL" as Department,
    division: "ALL" as Division,
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH INITIAL DATA (REAL API CALL) ---
  useEffect(() => {
    const loadReminders = async () => {
      // Basic check for token/auth might be added here before API call
      setIsLoading(true);
      try {
        // Data is now expected to be filtered by the backend API call
        const fetchedReminders = await fetchRemindersFromDB();
        setReminders(fetchedReminders);
      } catch (error) {
        console.error("Failed to load reminders:", error);
        // Add logic to handle redirection if error is 401/403
      } finally {
        setIsLoading(false);
      }
    };
    loadReminders();
    // Re-run the effect if user details change, forcing a fresh API fetch
  }, [user.department, user.division, user.role]); 

  // --- HANDLERS ---
  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    try {
      // 1. Save to database via real API call
      const newReminder = await saveReminderToDB(form);

      // 2. Update local state with the new reminder (including the actual ID)
      setReminders((prev) => [...prev, newReminder]);

      // 3. Reset form
      setForm(initialFormState);
    } catch (error) {
      console.error("Could not add reminder:", error);
      // Optional: Show an error notification to the user
    }
  };

  const deleteReminder = (id: number) => {
    // In a real app, you would add an API call here:
    // try { await axios.delete(`http://localhost:5000/api/reminders/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}}); }
    setReminders(reminders.filter((r) => r.id !== id));
  };

  // --- UI COMPONENTS ---
  // (DepartmentSelect, DivisionSelect, ReminderItem remain unchanged)

  const DepartmentSelect: React.FC = () => (
    <select
      className="border rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      value={form.department}
      onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
    >
      <option value="ALL">Department: ALL</option>
      <option value="INFT">INFT</option>
      <option value="COMP">COMP</option>
      <option value="EXTC">EXTC</option>
      <option value="EXCS">EXCS</option>
    </select>
  );

  const DivisionSelect: React.FC = () => (
    <select
      className="border rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      value={form.division}
      onChange={(e) => setForm({ ...form, division: e.target.value as Division })}
    >
      <option value="ALL">Division: ALL</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
  );

  const ReminderItem: React.FC<{ r: Reminder }> = ({ r }) => (
    <div
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl shadow-lg flex justify-between items-start border-l-4 border-blue-500 hover:shadow-xl transform hover:scale-[1.01] transition duration-300 ease-in-out animate-fadeIn"
    >
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-1 leading-tight">{r.title}</h3>
        <p className="text-xs font-medium text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full inline-block mb-2">
          {r.department} / {r.division}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">📅 **Due:** {r.date}</p>
        {r.note && (
          <p className="text-sm italic text-gray-600 dark:text-gray-400 border-l-2 pl-2 mt-2 border-gray-300 dark:border-gray-600">
            {r.note}
          </p>
        )}
      </div>
      {isEditable && (
        <button
          onClick={() => deleteReminder(r.id)}
          className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition duration-150 transform hover:scale-110"
          aria-label={`Delete reminder: ${r.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.728-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 p-6 sm:p-10">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-500 pt-12">
          <span className="inline-block animate-pulse mr-2 "></span> Academic Reminders
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Viewing reminders for **{user.role.toUpperCase()}** (Dept: **{user.department}**, Div: **{user.division}**)
        </p>
      </header>

      {/* --- ADD REMINDER FORM (STAFF/ADMIN ONLY) --- */}
      {isEditable && (
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-2xl shadow-2xl max-w-lg mx-auto mb-10 transform transition duration-300 hover:shadow-blue-500/50">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            Create New Reminder
          </h2>
          <form onSubmit={addReminder} className="grid gap-4">
            <input
              placeholder="Reminder Title (e.g., Mid-Term Dates)"
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="date"
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                />
                <div className="grid grid-cols-2 gap-2">
                    <DepartmentSelect />
                    <DivisionSelect />
                </div>
            </div>
            <textarea
              placeholder="Detailed Notes (optional)"
              rows={3}
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition duration-200 transform hover:scale-[1.01] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              ➕ Publish Reminder
            </button>
          </form>
        </div>
      )}

      {/* --- REMINDER LIST --- */}
      <main className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          {user.role === 'student' ? "Your Relevant Reminders" : "All System Reminders"}
        </h2>
        
        {isLoading ? (
            <p className="text-center text-xl text-blue-400 dark:text-blue-300 animate-bounce pt-10">Loading reminders...</p>
        ) : reminders.length === 0 ? ( // Display based on the fetched/filtered list
          <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {user.role === 'student' ? 
                "🎉 No reminders for your department/division yet. Check back later!" : 
                "No system reminders have been added."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reminders.map((r) => ( // Use the 'reminders' state directly
              <ReminderItem key={r.id} r={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}