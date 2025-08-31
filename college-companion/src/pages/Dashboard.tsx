import { useState, useEffect } from "react";
import { Home, Users, BookOpen, BarChart2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [role, setRole] = useState<string | null>(null);

  // ✅ Load role from localStorage (saved during login)
  useEffect(() => {
    const tokenData = localStorage.getItem("role"); // you must store role in localStorage when logging in
    if (tokenData) {
      setRole(tokenData);
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return role === "admin" ? (
          <div className="p-6 text-gray-800">👥 Manage Users</div>
        ) : (
          <div className="p-6 text-red-500">❌ Access Denied</div>
        );

      case "departments":
        return role === "admin" ? (
          <div className="p-6 text-gray-800">🏫 Manage Departments</div>
        ) : (
          <div className="p-6 text-red-500">❌ Access Denied</div>
        );

      case "reports":
        return role === "admin" ? (
          <div className="p-6 text-gray-800">📊 View Reports</div>
        ) : (
          <div className="p-6 text-red-500">❌ Access Denied</div>
        );

      default:
        return <div className="p-6 text-gray-800">🏠 Welcome to {role} Dashboard</div>;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600 p-6 shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {role?.toUpperCase()} Panel
        </h2>

        <nav className="flex flex-col gap-4">
          {/* Home - everyone */}
          <button
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700 transition ${
              activeSection === "home" ? "bg-blue-600" : ""
            }`}
            onClick={() => setActiveSection("home")}
          >
            <Home size={20} /> Home
          </button>

          {/* Admin-only menu */}
          {role === "admin" && (
            <>
              <button
                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700 transition ${
                  activeSection === "users" ? "bg-blue-600" : ""
                }`}
                onClick={() => setActiveSection("users")}
              >
                <Users size={20} /> Users
              </button>

              <button
                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700 transition ${
                  activeSection === "departments" ? "bg-blue-600" : ""
                }`}
                onClick={() => setActiveSection("departments")}
              >
                <BookOpen size={20} /> Departments
              </button>

              <button
                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700 transition ${
                  activeSection === "reports" ? "bg-blue-600" : ""
                }`}
                onClick={() => setActiveSection("reports")}
              >
                <BarChart2 size={20} /> Reports
              </button>
            </>
          )}

          {/* Logout */}
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-600 transition mt-8">
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 p-6 rounded-xl shadow-md h-full"
        >
          {renderSection()}
        </motion.div>
      </main>
    </div>
  );
}
