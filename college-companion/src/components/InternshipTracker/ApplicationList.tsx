import React, { useState } from "react";
import ApplicationCard from "./ApplicationCard";
import ApplicationDetailsModal from "./ApplicationDetailsModal";

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
}

const ApplicationList: React.FC = () => {
  const [applications] = useState<Application[]>([
    { id: 1, company: "Google", role: "SDE Intern", status: "Interviewing" },
    { id: 2, company: "Microsoft", role: "Backend Developer", status: "Applied" },
  ]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          app={app}
          onClick={() => setSelectedApp(app)}
        />
      ))}

      {selectedApp && (
        <ApplicationDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default ApplicationList;
