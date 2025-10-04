import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Ensure you have react-icons/fa installed: npm install react-icons/fa
import { FaCalendarAlt, FaUserGraduate, FaClipboardCheck, FaBell, FaUserCircle } from "react-icons/fa";

export default function Home() {
  return (
    
    <div className="relative bg-white dark:bg-gray-900 transition-colors duration-500">
      
      {/* Hero Section: The Blue Part (UI Changes Applied) */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 
                  bg-gray-900 dark:bg-gray-900 overflow-hidden" // Changed gradient to flat dark color for consistency
      >

        {/* Background Image */}
        <img
          src="/welcome.jpg"
          alt="College Companion Welcome"
          className="absolute inset-0 w-full h-full object-cover opacity-30" // Reduced opacity for a modern, subdued look
        />
        {/* Dark Overlay (Ensuring High Contrast) */}
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70 dark:bg-gray-900/80" />


        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-white max-w-4xl p-6 z-10" // Added z-10 to ensure it's above the overlay
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Empowering Your College Journey
          </h1>
          <p className="mb-10 text-xl md:text-2xl opacity-90 font-light">
            Your centralized hub for academic organization, career tracking, and personalized reminders.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Primary Button: Login (Themed Blue) */}
            <Link
              to="/login"
              className="px-10 py-4 rounded-xl bg-blue-600 text-white font-bold 
                          hover:bg-blue-700 transition shadow-lg text-lg" // Modern, rounded-xl button
            >
              Get Started Now
            </Link>
            
            {/* Secondary Button: Register (Clean Border Style) */}
            <Link
              to="/register"
              className="px-10 py-4 rounded-xl border-2 border-white text-white font-medium 
                          hover:bg-white hover:text-blue-700 transition shadow-lg text-lg" // Modern, rounded-xl button
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section (No Change) */}
<section id="features" className="py-20 bg-gray-50 dark:bg-gray-800 text-center dark:text-white transition-colors duration-500">
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="text-3xl md:text-4xl font-bold mb-12 text-blue-600 dark:text-blue-400"
  >
    Core Features
  </motion.h2>

  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6">
    {[
      { icon: <FaCalendarAlt />, title: "Timetable", desc: "Keep track of classes and schedules easily.", link: "/timetable" },
      { icon: <FaClipboardCheck />, title: "Attendance", desc: "Monitor and manage your attendance records.", link: "/attendance" },
      { icon: <FaBell />, title: "Reminders", desc: "Set reminders for exams, projects, and deadlines.", link: "/remainders" },
      { icon: <FaUserGraduate />, title: "Internship Tracker", desc: "Stay updated with your internships and career plans.", link: "/internship" },
      { icon: <FaUserCircle />, title: "Profile", desc: "Manage your personal information securely.", link: "/profile" },
      { icon: <FaUserCircle />, title: "User Management", desc: "Admin/Staff: View and manage all users.", link: "/users" }, // Added User Management
    ].map((feature, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center text-blue-900 dark:text-white"
      >
        <Link to={feature.link} className="flex flex-col items-center">
          <div className="text-4xl mb-4 text-blue-600 dark:text-blue-400">{feature.icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">{feature.desc}</p>
        </Link>
      </motion.div>
    ))}
  </div>
</section>


      {/* How It Works Section (Minor Dark Mode Fix) */}
      <section id="how-it-works" className="py-20 bg-blue-600 dark:bg-blue-800 text-white text-center transition-colors duration-500">
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
              <div className="w-12 h-12 flex items-center justify-center bg-white text-blue-600 rounded-full text-xl font-bold mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="opacity-80">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Get Started Section (No Change) */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900 text-center transition-colors duration-500">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-600 dark:text-blue-400">Get Started Today</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">Join thousands of students who stay productive with College Companion.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-md"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition font-semibold shadow-md"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer (Minor Dark Mode Fix) */}
      <footer className="bg-blue-900 dark:bg-gray-950 text-white text-center py-6 transition-colors duration-500">
        <p>© 2025 College Companion. All rights reserved.</p>
      </footer>
    </div>
  );
}