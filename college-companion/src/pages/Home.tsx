import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaUserGraduate, FaClipboardCheck, FaBell, FaUserCircle } from "react-icons/fa";

export default function Home() {
  return (
    
    <div className="relative">
      
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500"
      >

        {/* Background Image */}
        <img
          src="/welcome.jpg"
          alt="Welcome"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70" />


        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-white max-w-3xl p-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Your All-in-One College Companion
          </h1>
          <p className="mb-8 text-lg md:text-xl opacity-90">
            Stay on top of your schedule, attendance, reminders, and career growth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 rounded-full bg-white text-blue-700 font-medium hover:bg-blue-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 rounded-full border border-white text-white hover:bg-white hover:text-blue-700 transition"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
<section id="features" className="py-20 bg-gray-50 text-center">
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="text-3xl md:text-4xl font-bold mb-12 text-blue-900"
  >
    Features
  </motion.h2>

  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6">
    {[
      { icon: <FaCalendarAlt />, title: "Timetable", desc: "Keep track of classes and schedules easily.", link: "/timetable" },
      { icon: <FaClipboardCheck />, title: "Attendance", desc: "Monitor and manage your attendance records.", link: "/attendance" },
      { icon: <FaBell />, title: "Reminders", desc: "Set reminders for exams, projects, and deadlines.", link: "/remainders" },
      { icon: <FaUserGraduate />, title: "Internship Tracker", desc: "Stay updated with your internships and career plans.", link: "/internship" },
      { icon: <FaUserCircle />, title: "Profile", desc: "Manage your personal information securely.", link: "/profile" },
    ].map((feature, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.05 }}
        className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center text-blue-900"
      >
        <Link to={feature.link} className="flex flex-col items-center">
          <div className="text-4xl mb-4 text-blue-700">{feature.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-center">{feature.desc}</p>
        </Link>
      </motion.div>
    ))}
  </div>
</section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-blue-900 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12"
        >
          How It Works
        </motion.h2>
        <div className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto px-6">
          {[
            { step: "1", title: "Sign Up", desc: "Create your account and set up your profile." },
            { step: "2", title: "Organize", desc: "Add your timetable, reminders, and attendance." },
            { step: "3", title: "Stay Ahead", desc: "Track your progress and focus on growth." },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 p-8 rounded-2xl shadow-lg flex flex-col items-center"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white text-blue-900 rounded-full text-xl font-bold mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="opacity-80">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-gray-100 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">Get Started Today</h2>
        <p className="mb-6 text-gray-700">Join thousands of students who stay productive with College Companion.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-100 transition"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white text-center py-6">
        <p>© 2025 College Companion. All rights reserved.</p>
      </footer>
    </div>
  );
}
