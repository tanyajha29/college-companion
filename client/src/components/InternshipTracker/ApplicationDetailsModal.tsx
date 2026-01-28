import React from "react";

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
}

interface Props {
  app: Application;
  onClose: () => void;
}

const ApplicationDetailsModal: React.FC<Props> = ({ app, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold">{app.company}</h2>
        <p className="mt-2 text-gray-700">Role: {app.role}</p>
        <p className="mt-1 text-gray-600">Status: {app.status}</p>
        <div className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
