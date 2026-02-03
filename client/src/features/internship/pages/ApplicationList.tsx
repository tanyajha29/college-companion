// Example of how to use it in ApplicationList.tsx

import React from 'react';
import Application from './ApplicationForm'; // <-- Import the new component

interface ApplicationListProps {
    applications: any[];
    onSelect: (app: any) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onSelect }) => {

    if (applications.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                No applications tracked yet. Use the "Add New Application" button above to get started!
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden">
            {/* Header Row (Optional) */}
            <div className="grid grid-cols-5 gap-4 p-4 font-bold text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                <div className="col-span-2 sm:col-span-1">Company</div>
                <div className="col-span-3 sm:col-span-1">Role</div>
                <div className="hidden sm:block">Deadline</div>
                <div className="hidden sm:block">Stipend</div>
                <div className="text-right">Action</div>
            </div>
            
            {/* List of Applications */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map((app) => (
                    <Application 
                        key={app.internshipid} // Key must be the unique ID from the DB
                        application={app}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default ApplicationList;