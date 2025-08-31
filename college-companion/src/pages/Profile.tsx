import { useState, useEffect } from "react";
import { User, Mail, Phone, GraduationCap, Edit3, Save, Camera } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch profile from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  // ✅ Save profile
  const handleSave = () => {
    const token = localStorage.getItem("token");
    axios
      .put("http://localhost:5000/api/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
        setIsEditing(false);
      })
      .catch((err) => console.error("Error updating profile:", err));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!profile) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-20 p-4 sm:p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
          {/* Avatar placeholder */}
          <div className="relative">
            <div className="w-28 h-28 flex items-center justify-center rounded-full bg-blue-100 border-4 border-blue-500 shadow-md">
              <User size={48} className="text-blue-600" />
            </div>
          </div>

          {/* Name */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            <p className="text-gray-500">Profile Information</p>
          </div>

          {/* Edit / Save */}
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-4 py-2 text-sm flex items-center gap-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {/* Info Fields */}
        <div className="space-y-4">
          <Field
            icon={<User className="w-5 h-5 text-gray-600" />}
            label="Name"
            value={formData.username}
            name="name"
            isEditing={isEditing}
            onChange={handleChange}
          />
          <Field
            icon={<Mail className="w-5 h-5 text-gray-600" />}
            label="Email"
            value={formData.email}
            name="email"
            isEditing={isEditing}
            onChange={handleChange}
          />
          <Field
            icon={<GraduationCap className="w-5 h-5 text-gray-600" />}
            label="Department"
            value={formData.dept_id}
            name="dept"
            isEditing={isEditing}
            onChange={handleChange}
          />
          <Field
            icon={<Phone className="w-5 h-5 text-gray-600" />}
            label="Contact No"
            value={formData.contact_no}
            name="contact_no"
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

/* Reusable Field Component */
function Field({ icon, label, value, name, isEditing, onChange }: any) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          className="border rounded-lg px-3 py-2 w-full"
        />
      ) : (
        <span>
          <span className="font-medium">{label}: </span>
          {value}
        </span>
      )}
    </div>
  );
}
