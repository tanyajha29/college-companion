import React, { useState } from "react";
import TrackerDashboard from "../components/InternshipTracker/TrackerDashboard";
import ApplicationForm from "../components/InternshipTracker/ApplicationForm";
import ApplicationList from "../components/InternshipTracker/ApplicationList";
import ApplicationDetailsModal from "../components/InternshipTracker/ApplicationDetailsModal";
import UploadDocuments from "../components/InternshipTracker/UploadDocuments";

const InternshipTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddApplication = (newApp: any) => {
    setApplications((prev) => [...prev, newApp]);
    setShowForm(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-[url('/auditorium.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-blue-400/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-5xl mx-auto pt-24"> 
        {/* 🔑 Added pt-24 so heading clears fixed navbar */}
        <h1 className="text-4xl font-extrabold text-center text-white mb-10">
          Internship & Placement Tracker
        </h1>

        {/* Dashboard */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <TrackerDashboard applications={applications} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "➕ Add Application"}
          </button>
          <button
            onClick={() => alert("Document upload clicked")}
            className="px-6 py-2 rounded-xl bg-green-600 text-white shadow-lg hover:bg-green-700 transition"
          >
            📂 Upload Documents
          </button>
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-10 text-center">
            <ApplicationForm onAdd={handleAddApplication} />
          </div>
        )}

        {/* Application List */}
        <div className="max-w-4xl mx-auto text-center">
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

        {/* Upload Documents */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <UploadDocuments />
        </div>
      </div>
    </div>
  );
};

export default InternshipTrackerPage;
