import { useState, useCallback } from "react";
import { Home, Users, BookOpen, BarChart2, LogOut, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

// Dashboard sections
import HomeSection from "../components/DashboardManagement/HomeSection";
import AdminUserManagement from "../components/DashboardManagement/AdminUserManagement";
import AdminDepartmentManagement from "../components/DashboardManagement/AdminDepartmentManagement";
import AdminReportDashboard from "../components/DashboardManagement/AdminReportDashboard";
import StudentDashboard from "../components/DashboardManagement/StudentDashboard";

import { useAuth } from "../../../shared/context/AuthContext";

// Utility to capitalize for headings
const capitalize = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// Navigation items shown in sidebar
const navItems = [
  { id: "home", label: "Dashboard", icon: Home, roles: ["admin", "staff", "student"] },
  { id: "users", label: "Users", icon: Users, roles: ["admin"] },
  { id: "departments", label: "Departments", icon: BookOpen, roles: ["admin"] },
  { id: "reports", label: "Reports", icon: BarChart2, roles: ["admin"] },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Normalize role for comparisons
  const role = user?.role?.toLowerCase?.() ?? null;

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);

  const renderSectionContent = () => {
    const title = navItems.find((item) => item.id === activeSection)?.label || capitalize(activeSection);

    let content;

    if (!role) {
      content = <div className="text-red-500 font-medium">Session data missing. Please log in again.</div>;
    } else {
      switch (activeSection) {
        case "users":
          content = role === "admin" ? (
            <AdminUserManagement />
          ) : (
            <div className="text-red-500 font-medium">Access Denied: Administrator role required.</div>
          );
          break;

        case "departments":
          content = role === "admin" ? (
            <AdminDepartmentManagement />
          ) : (
            <div className="text-red-500 font-medium">Access Denied: Administrator role required.</div>
          );
          break;

        case "reports":
          content = role === "admin" ? (
            <AdminReportDashboard />
          ) : (
            <div className="text-red-500 font-medium">Access Denied: Administrator role required.</div>
          );
          break;

        default:
          if (role === "admin" || role === "staff") {
            content = <HomeSection role={role} />;
          } else if (role === "student") {
            content = <StudentDashboard />;
          } else {
            content = <div className="p-4 text-gray-700">Role-specific content goes here.</div>;
          }
          break;
      }
    }

    return (
      <>
        <h1 className="page-title text-3xl font-extrabold border-b pb-4 mb-6 border-white/10 transition-colors duration-500">
          {title}
        </h1>
        <div className="pt-3">{content}</div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-blue-700 dark:bg-gray-900 dark:text-blue-400 transition-colors duration-500">
        <p className="animate-bounce">Loading Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return (
      <div className="p-10 text-center text-red-600 dark:bg-gray-900 dark:text-red-400 min-h-screen">
        Session expired or not logged in. Please{" "}
        <a href="/login" className="underline font-bold">
          login
        </a>
        .
      </div>
    );
  }

  return (
    <div className="glow-page flex min-h-screen transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 shadow-2xl dark:shadow-gray-950/50 text-white flex flex-col transition-colors duration-500">
        <div className="mb-8 pt-2 pb-6 border-b border-gray-700 dark-border-gray-800">
          <div className="flex items-center gap-3 pt-10">
            <GraduationCap size={32} className="text-blue-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-white dark:text-gray-50">College Portal</h2>
          </div>
          <p className="text-xs text-blue-300 mt-2 ml-10 font-medium">{capitalize(role)} Panel</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            if (!item.roles.includes(role)) return null;
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out text-base ${
                  isActive ? "bg-blue-600 font-semibold shadow-lg shadow-blue-500/50" : "hover:bg-gray-700 text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-blue-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 p-3 rounded-xl transition duration-200 ease-in-out bg-red-600 hover:bg-red-700 text-white font-semibold mt-auto shadow-lg hover:shadow-xl"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glow-card p-8 rounded-3xl shadow-2xl h-full text-white transition-colors duration-500"
        >
          {renderSectionContent()}
        </motion.div>
      </main>
    </div>
  );
}
