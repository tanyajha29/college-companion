import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Edit3, Save, Camera, X } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const API_BASE =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    username: "",
    email: "",
    contact_no: "",
    Role: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      .catch(() => setIsLoading(false));
  }, []);

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
      });
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d1f] text-blue-400">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d1f] text-red-400">
        Profile not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0d1f] text-white px-6 py-14">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your personal information
        </p>
      </header>

      {/* 🔥 MAGIC BORDER CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-glow max-w-3xl mx-auto"
      >
        {/* CONTENT LAYER */}
        <div className="relative z-10 p-8 rounded-3xl border border-white/10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/10 pb-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full flex items-center justify-center 
                              bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                              border border-blue-400/40 shadow-[0_0_25px_rgba(96,165,250,0.35)]">
                <User size={46} className="text-blue-400" />
              </div>

              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 rounded-full 
                                   bg-blue-600 hover:bg-blue-700 transition">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold">
                {profile.username}
              </h2>
              <p className="text-sm text-blue-400 mt-1">
                {profile.Role || "USER"}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 
                               flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 
                               flex items-center justify-center gap-2 transition"
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 
                             flex items-center gap-2 transition shadow-lg"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-6">
            <Field icon={<User />} label="Username" value={formData.username}
              name="username" isEditing={isEditing} onChange={handleChange} />
            <Field icon={<Mail />} label="Email" value={formData.email}
              name="email" isEditing={isEditing} onChange={handleChange} />
            <Field icon={<Phone />} label="Contact No" value={formData.contact_no}
              name="contact_no" isEditing={isEditing} onChange={handleChange} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* 🔹 Field Component */
function Field({ icon, label, value, name, isEditing, onChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 border-b border-white/10 pb-3">
      <span className="flex items-center gap-3 text-gray-400 min-w-[140px]">
        {React.cloneElement(icon, {
          className: "w-5 h-5 text-blue-400",
        })}
        {label}
      </span>

      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2
                     focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      ) : (
        <span className="flex-1 text-white">{value || "N/A"}</span>
      )}
    </div>
  );
}
