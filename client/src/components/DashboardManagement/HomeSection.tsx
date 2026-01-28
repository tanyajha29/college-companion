
import { motion } from "framer-motion";
import { Users, Briefcase, BookOpen } from "lucide-react";

interface HomeSectionProps {
  role: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardData: { [key: string]: { title: string; icon: JSX.Element; color: string; description: string; } } = {
  admin: {
    title: "System Overview",
    icon: <Users size={32} className="text-blue-500" />,
    color: "bg-blue-50",
    description: "Manage all users, departments, and system configurations. Full administrative access.",
  },
  staff: {
    title: "Your Faculty Portal",
    icon: <Briefcase size={32} className="text-green-500" />,
    color: "bg-green-50",
    description: "Access class schedules, submission portals, and faculty-specific reports.",
  },
  student: {
    title: "Your Student Space",
    icon: <BookOpen size={32} className="text-purple-500" />,
    color: "bg-purple-50",
    description: "View grades, upcoming assignments, and departmental resources.",
  },
};

export default function HomeSection({ role }: HomeSectionProps) {
  const data = cardData[role] || cardData['student']; // Default to student if role is unknown

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}!</h2>
      <p className="text-gray-600">
        Your dashboard provides quick access to tools and information tailored to your role at the college.
      </p>

      <motion.div
        className={`p-6 rounded-xl shadow-lg border-l-4 border-l-${data.color.slice(3)} ${data.color}`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-4">
          {data.icon}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{data.title}</h3>
            <p className="text-sm text-gray-600">{data.description}</p>
          </div>
        </div>
      </motion.div>
      
      {/* Quick Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <motion.div className="bg-white p-4 rounded-lg shadow border-b-4 border-blue-500" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <p className="text-3xl font-bold text-gray-900">120</p>
            <p className="text-sm text-gray-500">Total Students</p>
        </motion.div>
        <motion.div className="bg-white p-4 rounded-lg shadow border-b-4 border-green-500" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <p className="text-3xl font-bold text-gray-900">4</p>
            <p className="text-sm text-gray-500">Departments</p>
        </motion.div>
        <motion.div className="bg-white p-4 rounded-lg shadow border-b-4 border-purple-500" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <p className="text-3xl font-bold text-gray-900">{role === 'admin' ? '24' : '5'}</p>
            <p className="text-sm text-gray-500">{role === 'admin' ? 'Active Faculty' : 'Upcoming Assignments'}</p>
        </motion.div>
      </div>
    </div>
  );
}