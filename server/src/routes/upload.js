// auth-backend/src/routes/upload.js

import express from 'express';
import multer from 'multer'; // For handling file uploads       
import path from 'path';
// Note: We do NOT create a new DB pool here. The main pool is in index.js
// We'll add DB logic later to log uploaded files.


const router = express.Router();

// 1. Setup Storage for Multers
// This configuration saves files to a 'uploads' folder in the root of your project
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure you create this 'uploads' directory in your auth-backend folder!
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Creates a unique file name
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. Initialize Upload Middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
});

// 3. Define the POST route for file upload
// The field name 'document' must match the name used in your UploadDocuments.tsx component
router.post('/document', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file selected for upload.' });
  }

  // NOTE: You need a database table (e.g., 'documents') to log this file. 
  // For now, we'll return the success status.
  try {
    // 💡 Add DB insertion logic here later, linking the file path (req.file.path)
    // and other metadata (e.g., associated internship ID) to a 'documents' table.
    console.log(`File uploaded successfully: ${req.file.filename}`);

    res.status(200).json({
      message: 'File uploaded successfully',
      fileName: req.file.filename,
      filePath: req.file.path,
    });
  } catch (error) {
    console.error('Error during file upload process:', error);
    res.status(500).json({ message: 'Internal Server Error during upload processing.' });
  }
});

export default router;