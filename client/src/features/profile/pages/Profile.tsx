import React, { useState, useEffect } from "react";
import { User, Mail, Phone, GraduationCap, Edit3, Save, Camera, X } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    username:"",
    email: "",
    contact_no: "",
    Role: "",
});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch profile from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
    });
  }, []);

  // ✅ Save profile
  const handleSave = () => {
    const token = localStorage.getItem("token");
    axios
      .put(`${API_BASE}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
        setIsEditing(false);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };
    
  // Added function to discard changes and exit edit mode
  const handleCancel = () => {
      setFormData(profile); // Reset form data to the original profile data
      setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-xl text-blue-600 dark:text-blue-400">Loading profile data...</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-400">Profile data not found.</p>
    </div>
  );

  return (
   
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 p-6 sm:p-10">
      
      <header className="max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 text-center pt-12">
              My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
              View and manage your personal details.
          </p>
      </header>

      {/* The main profile card */}
      <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-700"
        >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 border-4 border-blue-500 dark:border-blue-400 shadow-md">
              <User size={48} className="text-blue-600 dark:text-blue-400" />
            </div>
            {/* Optional: Add a subtle overlay for the camera icon */}
            {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-white dark:border-gray-800 hover:bg-blue-700 transition">
                    <Camera size={18} />
                </button>
            )}
          </div>

          {/* Name */}
          <div className="flex-1 text-center sm:text-left mt-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {profile.username || "N/A"}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {profile.Role || "USER"}
            </p>
          </div>

          {/* Edit / Save / Cancel Buttons */}
          <div className="flex flex-col space-y-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            className="w-full px-4 py-2 text-sm flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
                        >
                            <Save size={16} /> Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full px-4 py-2 text-sm flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition shadow-md"
                    >
                        <Edit3 size={16} /> Edit Profile
                    </button>
                )}
            </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-6">
          <Field
            icon={<User />}
            label="Username"
            value={formData.username}
            name="username" // Changed from 'name' to 'username' to align with formData
            isEditing={isEditing}
            onChange={handleChange}
          />
          <Field
            icon={<Mail />}
            label="Email"
            value={formData.email}
            name="email"
            isEditing={isEditing}
            onChange={handleChange}
          />
          
          <Field
            icon={<Phone />}
            label="Contact No"
            value={formData.contact_no}
            name="contact_no"
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* Reusable Field Component (Themed) */
function Field({ icon, label, value, name, isEditing, onChange }: any) {
  return (
    
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
      
     
      <span className="flex items-center gap-3 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 min-w-[150px]">
        {React.cloneElement(icon, { className: "w-5 h-5 text-blue-500 dark:text-blue-400" })}
        {label}
      </span>

      {/* Value or Input Field on the right */}
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
           
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
          />
        ) : (
          <span className="text-base font-medium text-gray-800 dark:text-gray-200">
            {value || "N/A"}
          </span>
        )}
      </div>
    </div>
  );
}
