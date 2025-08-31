import React from "react";
import ApplicationForm from "./ApplicationForm";
import ApplicationList from "./ApplicationList";
import UploadDocuments from "./UploadDocuments";

const TrackerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Add New Application</h2>
        <ApplicationForm />
      </div>

      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Your Applications</h2>
        <ApplicationList />
      </div>

      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Upload Documents</h2>
        <UploadDocuments />
      </div>
    </div>
  );
};

export default TrackerDashboard;
