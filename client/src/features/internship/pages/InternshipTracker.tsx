import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../shared/api";
import { Plus, Upload, X, Clock, DollarSign, Calendar, Mail, Building, Briefcase, ChevronRight, Save, CornerUpLeft } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

// --- Interfaces ---

// Define the structure of data returned from the backend/used in the form
interface ApplicationData {
    internshipid?: number; // Unique ID from DB
    companyname: string;
    jobtitle: string;
    status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Hold';
    description: string; 
    stipend: number;     
    applicationdeadline: string;   
    nextinterviewdate: string | null; 
    created_at?: string; // Timestamp from DB
}

interface ApplicationFormProps {
    onAdd: (newApp: ApplicationData) => void;
}

interface ApplicationRowProps {
    application: ApplicationData;
    onSelect: (app: ApplicationData) => void;
}

interface ApplicationListProps {
    applications: ApplicationData[];
    onSelect: (app: ApplicationData) => void;
}

interface ApplicationDetailsModalProps {
    application: ApplicationData;
    onClose: () => void;
    onUpdate: (appId: number, data: Partial<ApplicationData>) => void;
}

// --- Utility Components ---

const StatusBadge: React.FC<{ status: ApplicationData['status'] }> = ({ status }) => {
    let classes = "";
    switch (status) {
        case 'Applied':
            classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            break;
        case 'Interviewing':
            classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            break;
        case 'Offer':
            classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            break;
        case 'Rejected':
            classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            break;
        case 'Hold':
            classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            break;
    }
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${classes}`}>
            {status}
        </span>
    );
};

// --- 1. TrackerDashboard (Placeholder) ---
// Meets part of 4.4.2 by displaying high-level stats based on current applications.
const TrackerDashboard: React.FC<ApplicationListProps> = ({ applications }) => {
    const total = applications.length;
    const interviewing = applications.filter(a => a.status === 'Interviewing').length;
    const offers = applications.filter(a => a.status === 'Offer').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;

    const stats = [
        { label: "Total Apps", value: total, color: "text-blue-500", icon: <Briefcase size={20} /> },
        { label: "Interviewing", value: interviewing, color: "text-purple-500", icon: <Mail size={20} /> },
        { label: "Offers Received", value: offers, color: "text-green-500", icon: <DollarSign size={20} /> },
        { label: "Rejected", value: rejected, color: "text-red-500", icon: <X size={20} /> },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.label} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-opacity-10 ${stat.color}`}>{stat.icon}</div>
                </div>
            ))}
        </div>
    );
};


// --- 2. ApplicationForm (Based on User's snippet) ---
// Meets REQ-10: Allows users to log application details.
const ApplicationForm: React.FC<ApplicationFormProps> = ({ onAdd }) => {
    // Initial state matching ApplicationData structure
    const [formData, setFormData] = useState<ApplicationData>({
        companyname: "",
        jobtitle: "",
        status: "Applied", 
        description: "",   
        stipend: 0, // Changed to 0 to match DB type
        applicationdeadline: "",
        nextinterviewdate: null,
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'stipend' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!formData.companyname.trim() || !formData.jobtitle.trim() || !formData.applicationdeadline.trim()) {
            setError("Company, Role, and Application Deadline are required fields.");
            return;
        }

        // Call the parent handler
        onAdd(formData);

        // Reset the form after successful submission
        setFormData({
            companyname: "",
            jobtitle: "",
            status: "Applied",
            description: "",
            stipend: 0,
            applicationdeadline: "",
            nextinterviewdate: null,
        });
    };

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150";

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                Add New Application
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                    <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</p>
                )}

                {/* Row 1: Company and Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="companyname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                        <input
                            type="text"
                            name="companyname"
                            id="companyname"
                            value={formData.companyname}
                            onChange={handleChange}
                            placeholder="e.g., Google"
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="jobtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title / Role *</label>
                        <input
                            type="text"
                            name="jobtitle"
                            id="jobtitle"
                            value={formData.jobtitle}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer Intern"
                            className={inputClasses}
                            required
                        />
                    </div>
                </div>

                {/* Row 2: Status, Deadline, and Stipend */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Status</label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hold">On Hold</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="applicationdeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                        <input
                            type="date"
                            name="applicationdeadline"
                            id="applicationdeadline"
                            value={formData.applicationdeadline}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stipend (monthly)</label>
                        <input
                            type="number"
                            name="stipend"
                            id="stipend"
                            value={formData.stipend}
                            onChange={handleChange}
                            placeholder="e.g., 50000"
                            className={inputClasses}
                        />
                    </div>
                </div>
                
                {/* Row 3: Interview Date */}
                <div>
                    <label htmlFor="nextinterviewdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Interview Date/Time (Optional)</label>
                    <input
                        type="datetime-local" 
                        name="nextinterviewdate"
                        id="nextinterviewdate"
                        // Handle null case for controlled component
                        value={formData.nextinterviewdate || ''}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>

                {/* Row 4: Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description Notes</label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Key responsibilities, technology stack, location, etc."
                        rows={3}
                        className={inputClasses}
                    />
                </div>
                
                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-200 transform hover:scale-[1.01]"
                    >
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- 3. ApplicationRow (Individual Item for the List) ---
const ApplicationRow: React.FC<ApplicationRowProps> = ({ application, onSelect }) => {
    
    const formattedDeadline = application.applicationdeadline 
        ? new Date(application.applicationdeadline).toLocaleDateString() 
        : 'N/A';

    return (
        <div 
            className="grid grid-cols-5 gap-4 p-4 text-sm items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
            onClick={() => onSelect(application)}
        >
            <div className="col-span-2 sm:col-span-1 font-semibold text-gray-900 dark:text-white truncate">
                {application.companyname}
            </div>
            <div className="col-span-3 sm:col-span-1 text-gray-600 dark:text-gray-300 truncate">
                {application.jobtitle}
            </div>
            <div className="hidden sm:block text-gray-500 dark:text-gray-400">
                {formattedDeadline}
            </div>
            <div className="hidden sm:block text-gray-500 dark:text-gray-400">
                {application.stipend ? `₹${application.stipend.toLocaleString()}` : 'Unpaid'}
            </div>
            <div className="text-right">
                <StatusBadge status={application.status} />
            </div>
        </div>
    );
};

// --- 4. ApplicationList (Based on User's snippet, using ApplicationRow) ---
const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onSelect }) => {

    if (applications.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <Briefcase size={40} className="mx-auto mb-3 text-gray-400" />
                No applications tracked yet. Use the "Add New Application" button above to get started!
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-4 p-4 font-bold text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1"><Building size={16}/> Company</div>
                <div className="col-span-3 sm:col-span-1 flex items-center gap-1"><Briefcase size={16}/> Role</div>
                <div className="hidden sm:block flex items-center gap-1"><Calendar size={16}/> Deadline</div>
                <div className="hidden sm:block flex items-center gap-1"><DollarSign size={16}/> Stipend</div>
                <div className="text-right flex justify-end items-center gap-1">Status</div>
            </div>
            
            {/* List of Applications */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map((app) => (
                    <ApplicationRow 
                        key={app.internshipid} 
                        application={app}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

// --- 5. ApplicationDetailsModal (Added for REQ-11 Update Logic) ---
const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ application, onClose, onUpdate }) => {
    // Local state for editing status and interview date
    const [editData, setEditData] = useState<Partial<ApplicationData>>({
        status: application.status,
        nextinterviewdate: application.nextinterviewdate || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleEditChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!application.internshipid) {
            setSaveError("Cannot update application: ID is missing.");
            return;
        }

        // Only send fields that were changed
        const updatePayload: Partial<ApplicationData> = {};
        if (editData.status !== application.status) {
            updatePayload.status = editData.status;
        }
        if (editData.nextinterviewdate !== application.nextinterviewdate) {
            updatePayload.nextinterviewdate = editData.nextinterviewdate;
        }

        if (Object.keys(updatePayload).length === 0) {
            onClose(); // Close if nothing changed
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        
        try {
            await onUpdate(application.internshipid, updatePayload);
            onClose(); 
        } catch (e: any) {
            setSaveError(`Failed to save changes: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150";

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glow-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{application.companyname}</h3>
                        <p className="text-lg text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-2"><Briefcase size={18} />{application.jobtitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    
                    {saveError && (
                        <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{saveError}</p>
                    )}

                    {/* Status Update (REQ-11) */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <Clock size={16} /> Current Application Status
                        </label>
                        <select
                            name="status"
                            id="status"
                            value={editData.status}
                            onChange={handleEditChange}
                            className={inputClasses}
                            disabled={isSaving}
                        >
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hold">On Hold</option>
                        </select>
                    </div>

                    {/* Next Interview Date Update (REQ-11) */}
                    <div>
                        <label htmlFor="nextinterviewdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <Calendar size={16} /> Next Interview Date/Time
                        </label>
                        <input
                            type="datetime-local" 
                            name="nextinterviewdate"
                            id="nextinterviewdate"
                            value={editData.nextinterviewdate || ''}
                            onChange={handleEditChange}
                            className={inputClasses}
                            disabled={isSaving}
                        />
                    </div>
                    
                    {/* Read-Only Details */}
                    <hr className="dark:border-gray-700" />
                    
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white pt-2">Details</h4>
                    
                    <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Deadline:</span> {application.applicationdeadline ? new Date(application.applicationdeadline).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Stipend:</span> {application.stipend ? `₹${application.stipend.toLocaleString()} / month` : 'Unpaid'}</p>

                    <div className="pt-2">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">Job Notes:</p>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm border-l-4 border-blue-400 pl-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                            {application.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 flex items-center gap-1"
                        disabled={isSaving}
                    >
                        <CornerUpLeft size={18} /> Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition duration-200 flex items-center gap-1"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <><Save size={18} /> Save Changes</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- 6. UploadDocuments (Placeholder for REQ-12) ---
const UploadDocuments: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        setUploadStatus('uploading');
        try {
            const presignRes = await api.post("/documents/presign", {
                fileName: file.name,
                contentType: file.type,
                label: "Internship Document",
            });
            const presignData = presignRes.data;

            await fetch(presignData.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            await api.post("/documents/confirm", {
                key: presignData.key,
                fileName: file.name,
                mimeType: file.type,
                label: "Internship Document",
            });

            setUploadStatus('success');
            setFile(null);
            setTimeout(onCancel, 2000);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus('error');
            alert("File upload failed. Check the console for details.");
        }
    };

    const statusMessage = {
        idle: "Select a file (PDF, DOCX, JPG) to upload (e.g., Resume, Cover Letter, Offer).",
        uploading: "Uploading file... please wait.",
        success: "Upload complete! Closing uploader.",
        error: "Upload failed. Please try again."
    }[uploadStatus];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                Document Uploader (REQ-12)
            </h2>
            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                    <input 
                        type="file" 
                        id="document-upload" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        disabled={uploadStatus === 'uploading'}
                    />
                    <label 
                        htmlFor="document-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition duration-150"
                    >
                        <Upload size={18} className="mr-2" />
                        {file ? file.name : 'Choose File'}
                    </label>
                    {file && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>}
                </div>

                <p className={`text-center text-sm font-medium ${
                    uploadStatus === 'success' ? 'text-green-600' : 
                    uploadStatus === 'error' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                }`}>
                    {statusMessage}
                </p>

                <div className="flex justify-center gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150"
                        disabled={uploadStatus === 'uploading'}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleUpload}
                        className="px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700"
                        disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
                    >
                        <Upload size={20}/> Upload Document
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 7. Resume Compatibility Scorer ---
const ResumeScorer: React.FC = () => {
    const [resumeText, setResumeText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleScore = async () => {
        if ((!resumeText.trim() && !resumeFile) || !jobDescription.trim()) return;
        try {
            setLoading(true);
            let data;
            if (resumeFile) {
                const form = new FormData();
                form.append("resume", resumeFile);
                form.append("jobDescription", jobDescription);
                const res = await api.post("/ai/resume-score-pdf", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                data = res.data;
            } else {
                const res = await api.post("/ai/resume-score", { resumeText, jobDescription });
                data = res.data;
            }
            setResult(data);
        } catch (e: any) {
            setResult({ summary: e.message || "Failed to score resume" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                Resume Compatibility Score
            </h2>
            <div className="grid gap-4">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                />
                <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
                <button
                    onClick={handleScore}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Scoring..." : "Get Compatibility Score"}
                </button>
                {result && (
                    <div className="bg-indigo-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
                        {result.score !== undefined && (
                            <p className="font-semibold">Score: {result.score}</p>
                        )}
                        {result.summary && <p className="mt-2">{result.summary}</p>}
                        {result.strengths?.length ? (
                            <p className="mt-2">Strengths: {result.strengths.join(", ")}</p>
                        ) : null}
                        {result.gaps?.length ? (
                            <p className="mt-1">Gaps: {result.gaps.join(", ")}</p>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Application Component (InternshipTrackerPage) ---
const InternshipTrackerPage: React.FC = () => {
    
    // State Management
    const nav = useNavigate();
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 
    const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);

    const cardClasses = "glow-card shadow-2xl rounded-3xl p-6 border border-white/10";

    // Data Fetching (Read)
    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login to view internships.");
                setIsLoading(false);
                nav("/login");
                return;
            }
            const response = await api.get("/internships");
            const data: ApplicationData[] = response.data;
            // Ensure stipend is a number (it comes back as string from PostgreSQL JSON usually)
            const cleanedData = data.map(app => ({
                ...app,
                stipend: typeof app.stipend === 'string' ? parseInt(app.stipend, 10) : app.stipend
            }));
            
            setApplications(cleanedData); 
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch applications:", err);
            setError(`Failed to load applications. Check server logs. Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]); 

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const res = await api.get("/documents/my");
                setDocuments(res.data || []);
            } catch {
                // ignore
            }
        };
        loadDocs();
    }, []);


    // Data Submission (Create) - REQ-10
    const handleAddApplication = async (formData: ApplicationData) => { 
        // Prepare data for API to match PostgreSQL columns
        const applicationData = {
            companyname: formData.companyname,
            jobtitle: formData.jobtitle,
            description: formData.description,
            stipend: formData.stipend, 
            applicationdeadline: formData.applicationdeadline, 
            status: formData.status, 
            nextinterviewdate: formData.nextinterviewdate, 
        };

        try {
            const response = await api.post("/internships", applicationData);
            const savedApplication: ApplicationData = response.data; 
            savedApplication.stipend = parseInt(savedApplication.stipend as any, 10) || 0;

            // Update local state with the new application data from the server
            setApplications((prev) => [...prev, savedApplication]);
            setShowForm(false); 
        } catch (err: any) {
            console.error("Error adding application:", err);
            // Use a custom alert component or state, as global alerts are blocked.
            setError(`[CREATE ERROR] Error adding application: ${err.message}. Check server logs.`); 
            setTimeout(() => setError(null), 5000);
        }
    };
    
    // Data Update (Update) - REQ-11
    const handleUpdateApplication = async (appId: number, updateData: Partial<ApplicationData>) => {
        const url = `/internships/${appId}`;
        
        // Ensure only valid updates are sent (like status and nextinterviewdate)
        const updatePayload: Partial<ApplicationData> = {};
        if (updateData.status) updatePayload.status = updateData.status;
        if (updateData.nextinterviewdate !== undefined) updatePayload.nextinterviewdate = updateData.nextinterviewdate || null;
        
        try {
            await api.put(url, updatePayload);

            // Update local state by merging the changes
            setApplications(prev => prev.map(app => 
                app.internshipid === appId ? { ...app, ...updatePayload } : app
            ));

        } catch (err: any) {
            console.error(`Error updating application ${appId}:`, err);
            setError(`[UPDATE ERROR] Failed to update application: ${err.message}.`);
            throw err; // Re-throw to be caught by the modal
        }
    };


    const handleCancel = () => {
        setShowForm(false);
        setShowUpload(false);
    }

    return (
        <div className="glow-page relative min-h-screen font-sans">
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto pt-10 pb-16"> 
                
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="page-title text-4xl sm:text-5xl font-extrabold text-center drop-shadow-md mb-2 pt-12"
                >
                    Internship & Placement Tracker
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10"
                >
                    Manage your career applications pipeline efficiently.
                </motion.p>

                {/* Loading/Error State */}
                {isLoading && (
                    <div className="text-center text-blue-600 dark:text-blue-400 text-xl p-10 flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading applications...
                    </div>
                )}

                {error && (
                    <div className={`max-w-4xl mx-auto mb-10 ${cardClasses} p-6 bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300`}>
                        <p className="font-bold">System Error:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {/* Dashboard Card (4.4.2 Dashboard Reflection) */}
                {!isLoading && !error && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`max-w-6xl mx-auto mb-10 ${cardClasses}`}
                    >
                        <TrackerDashboard applications={applications} onSelect={() => {}} />
                    </motion.div>
                )}

                
                {/* Controls and Forms */}
                <div className="max-w-6xl mx-auto">
                    {/* Controls */}
                    <div className="flex justify-center flex-wrap gap-4 mb-8">
                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                setShowUpload(false); 
                            }}
                            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 
                                ${showForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white transform hover:scale-[1.03]`}
                        >
                            {showForm ? <X size={20}/> : <Plus size={20}/>} 
                            {showForm ? "Close Form" : "Add New Application"}
                        </button>
                        
                        <button
                            onClick={() => {
                                setShowUpload(!showUpload);
                                setShowForm(false); 
                                setShowScore(false);
                            }}
                            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 
                                ${showUpload ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white transform hover:scale-[1.03]`}
                        >
                            {showUpload ? <X size={20}/> : <Upload size={20}/>} 
                            {showUpload ? "Close Uploader" : "Upload Documents (REQ-12)"}
                        </button>

                        <button
                            onClick={() => {
                                setShowScore(!showScore);
                                setShowForm(false);
                                setShowUpload(false);
                            }}
                            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-200 flex items-center gap-2 
                                ${showScore ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white transform hover:scale-[1.03]`}
                        >
                            {showScore ? <X size={20}/> : <Plus size={20}/>} 
                            {showScore ? "Close Scorer" : "Resume Compatibility"}
                        </button>
                    </div>

                    {/* Application Form (REQ-10) */}
                    <AnimatePresence>
                        {showForm && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`max-w-4xl mx-auto mb-10 ${cardClasses} overflow-hidden`}
                        >
                            <ApplicationForm onAdd={handleAddApplication} /> 
                        </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Upload Documents Component (REQ-12) */}
                    <AnimatePresence>
                        {showUpload && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`max-w-4xl mx-auto mb-10 ${cardClasses} overflow-hidden`}
                        >
                            <UploadDocuments onCancel={handleCancel} />
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Resume Scorer */}
                    <AnimatePresence>
                        {showScore && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`max-w-4xl mx-auto mb-10 ${cardClasses} overflow-hidden`}
                        >
                            <ResumeScorer />
                        </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Application List (Table/Grid) */}
                {!isLoading && (
                    <div className={`max-w-6xl mx-auto text-left mt-10 ${cardClasses} p-0 overflow-hidden`}>
                        <ApplicationList
                            applications={applications}
                            onSelect={(app) => setSelectedApplication(app)}
                        />
                    </div>
                )}

                {/* Uploaded Documents */}
                <div className={`max-w-6xl mx-auto text-left mt-10 ${cardClasses}`}>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Uploaded Documents</h3>
                    {documents.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
                    ) : (
                        <div className="grid gap-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="font-medium">{doc.file_name}</p>
                                    <p className="text-xs text-gray-500">Status: {doc.status}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal for Application Details and Update (REQ-11) */}
                <AnimatePresence>
                    {selectedApplication && (
                        <ApplicationDetailsModal
                            application={selectedApplication}
                            onClose={() => setSelectedApplication(null)}
                            onUpdate={handleUpdateApplication}
                        />
                    )}
                </AnimatePresence>
                
            </div>
        </div>
    );
};

export default InternshipTrackerPage;
