import React from "react";

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
}

interface Props {
  app: Application;
  onClick: () => void;
}

const ApplicationCard: React.FC<Props> = ({ app, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold">{app.company}</h3>
      <p className="text-sm text-gray-700">{app.role}</p>
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-md">
        {app.status}
      </span>
    </div>
  );
};

export default ApplicationCard;
