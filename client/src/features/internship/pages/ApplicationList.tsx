import { Calendar, DollarSign, Briefcase, Building } from "lucide-react";

type Application = {
    internshipid: number;
    companyname: string;
    jobtitle: string;
    applicationdeadline?: string;
    stipend?: number;
    status?: string;
};

interface ApplicationListProps {
    applications: Application[];
    onSelect: (app: Application) => void;
}

const ApplicationRow = ({ application, onSelect }: { application: Application; onSelect: (app: Application) => void }) => {
    const formattedDeadline = application.applicationdeadline
        ? new Date(application.applicationdeadline).toLocaleDateString()
        : "N/A";

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
                {application.stipend ? `₹${application.stipend.toLocaleString()}` : "Unpaid"}
            </div>
            <div className="text-right">
                {application.status && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {application.status}
                    </span>
                )}
            </div>
        </div>
    );
};

const ApplicationList = ({ applications, onSelect }: ApplicationListProps) => {
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
            <div className="grid grid-cols-5 gap-4 p-4 font-bold text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1">
                    <Building size={16} /> Company
                </div>
                <div className="col-span-3 sm:col-span-1 flex items-center gap-1">
                    <Briefcase size={16} /> Role
                </div>
                <div className="hidden sm:block flex items-center gap-1">
                    <Calendar size={16} /> Deadline
                </div>
                <div className="hidden sm:block flex items-center gap-1">
                    <DollarSign size={16} /> Stipend
                </div>
                <div className="text-right">Status</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map((app) => (
                    <ApplicationRow key={app.internshipid} application={app} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
};

export default ApplicationList;
