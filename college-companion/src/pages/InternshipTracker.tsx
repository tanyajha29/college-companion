import React, { useState } from "react";
import TrackerDashboard from "../components/InternshipTracker/TrackerDashboard";
import ApplicationForm from "../components/InternshipTracker/ApplicationForm";
import ApplicationList from "../components/InternshipTracker/ApplicationList";
import ApplicationDetailsModal from "../components/InternshipTracker/ApplicationDetailsModal";
import UploadDocuments from "../components/InternshipTracker/UploadDocuments";
import { Plus, Upload, X } from "lucide-react"; // Import icons for better button styling
import { motion, AnimatePresence } from "framer-motion";

const InternshipTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false); // State for the UploadDocuments component

  const handleAddApplication = (newApp: any) => {
    setApplications((prev) => [...prev, newApp]);
    setShowForm(false);
  };
  
  // Adjusted handleCancel to also close the form 
  const handleCancel = () => {
      setShowForm(false);
      setShowUpload(false);
  }

  // Define a simple card style for consistency
  const cardClasses = "bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700";

  return (
    <div className="relative min-h-screen bg-[url('/auditorium.jpg')] bg-center bg-cover bg-no-repeat bg-fixed">
      {/* 1. Overlay (Themed for Readability) */}
      {/* Ensure the overlay is dark enough for white text to pop */}
      <div className="absolute inset-0 bg-gray-900/70 dark:bg-gray-900/80 backdrop-blur-sm" />

      {/* 2. Content Container (Themed) */}
      {/* Increased max-w to 6xl and added more padding for spacious feel */}
      <div className="relative z-10 p-6 max-w-6xl mx-auto pt-20 pb-16"> 
        
        {/* Heading (Centered and Bold) */}
        <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold text-center text-white drop-shadow-lg mb-4"
        >
          Internship & Placement Tracker
        </motion.h1>
        <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-center text-blue-200 mb-12"
        >
            Manage your career applications pipeline efficiently.
        </motion.p>


        {/* Dashboard Card */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`max-w-4xl mx-auto mb-10 ${cardClasses} p-8`}
        >
          <TrackerDashboard applications={applications} />
        </motion.div>

        
        {/* Controls and Form Toggle Area */}
        <div className="max-w-4xl mx-auto">
            
            {/* Controls */}
            <div className="flex justify-center flex-wrap gap-4 mb-8">
              <button
                onClick={() => {
                    setShowForm(!showForm);
                    setShowUpload(false); // Close upload if opening form
                }}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 
                    ${showForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
              >
                {showForm ? <X size={20}/> : <Plus size={20}/>} 
                {showForm ? "Close Form" : "Add New Application"}
              </button>
              
              <button
                onClick={() => {
                    setShowUpload(!showUpload);
                    setShowForm(false); // Close form if opening upload
                }}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 
                    ${showUpload ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
              >
                {showUpload ? <X size={20}/> : <Upload size={20}/>} 
                {showUpload ? "Close Uploader" : "Upload Documents"}
              </button>
            </div>

            {/* Application Form */}
            <AnimatePresence>
                {showForm && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-2xl mx-auto mb-10 ${cardClasses}`}
                >
                    <ApplicationForm onAdd={handleAddApplication} />
                </motion.div>
                )}
            </AnimatePresence>
            
            {/* Upload Documents Component */}
            <AnimatePresence>
                {showUpload && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-2xl mx-auto mb-10 ${cardClasses}`}
                >
                    <UploadDocuments onCancel={handleCancel} />
                </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Application List (Table/Grid) */}
        <div className={`max-w-6xl mx-auto text-left mt-10 ${cardClasses}`}>
          <ApplicationList
            applications={applications}
            onSelect={(app) => setSelectedApplication(app)}
          />
        </div>

        {/* Modal for Application Details */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
        
      </div>
    </div>
  );
};

export default InternshipTrackerPage;