import React, { useState } from "react";

const UploadDocuments: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (file) {
      console.log("Uploading:", file.name);
      // TODO: handle actual upload logic
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Upload
      </button>
      {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}
    </div>
  );
};

export default UploadDocuments;
