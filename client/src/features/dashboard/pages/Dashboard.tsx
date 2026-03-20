import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Bell,
  Users,
  CheckCircle,
  Calendar,
  FileText,
  CreditCard,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import api from "../../../shared/api";
import { useAuth } from "../../../shared/context/AuthContext";

type AdminSummary = {
  role: string;
  cards: {
    users: number;
    students: number;
    faculty: number;
    departments: number;
    pendingDocuments: number;
    payments: { count: number; total: number };
    internships: number;
  };
  reminders: { title: string; date: string; note: string }[];
  audit: { action: string; created_at: string }[];
};

type FacultySummary = {
  role: string;
  upcomingClasses: any[];
  reminders: any[];
  atRiskStudents: any[];
};

type StudentSummary = {
  role: string;
  timetable: any[];
  attendance: { percentage: number; totalSessions: number; atRisk: boolean };
  reminders: any[];
  documents: any[];
  payments: any[];
  internships: any[];
};

type Summary = AdminSummary | FacultySummary | StudentSummary | null;

const Card = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <div className="glow-card p-4 rounded-2xl shadow text-white">
    <p className="text-sm text-white/70">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
    {hint && <p className="text-xs text-white/60 mt-1">{hint}</p>}
  </div>
);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const role = useMemo(() => user?.role?.toLowerCase?.() || null, [user]);
  const [summary, setSummary] = useState<Summary>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !role) {
      navigate("/login", { replace: true });
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        let endpoint = "";
        if (role === "admin") endpoint = "/dashboard/admin-summary";
        else if (role === "faculty" || role === "staff") endpoint = "/dashboard/faculty-summary";
        else if (role === "student") endpoint = "/dashboard/student-summary";
        else throw new Error("Unsupported role");

        const res = await api.get(endpoint);
        setSummary(res.data);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated || !role) {
    return <div className="p-8 text-red-500">Session expired. Please log in.</div>;
  }

  if (loading) {
    return <div className="p-8 text-white">Loading dashboard...</div>;
  }

  if (error || !summary) {
    return <div className="p-8 text-red-400">Error: {error}</div>;
  }

  const renderAdmin = (data: AdminSummary) => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card title="Total Users" value={data.cards.users} />
        <Card title="Students" value={data.cards.students} />
        <Card title="Faculty/Staff" value={data.cards.faculty} />
        <Card title="Departments" value={data.cards.departments} />
        <Card title="Pending Documents" value={data.cards.pendingDocuments} />
        <Card title="Payments" value={`₹${data.cards.payments.total}`} hint={`${data.cards.payments.count} payments`} />
        <Card title="Internships" value={data.cards.internships} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glow-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Bell size={18} /> Recent Reminders
          </div>
          <ul className="space-y-2 text-white">
            {data.reminders?.length ? (
              data.reminders.map((r, i) => (
                <li key={i} className="border-b border-white/10 pb-2">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-white/70">
                    {r.date?.slice(0, 10)} — {r.note}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-white/60">No reminders</p>
            )}
          </ul>
        </div>
        <div className="glow-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <AlertTriangle size={18} /> Recent Audit Logs
          </div>
          <ul className="space-y-2 text-white">
            {data.audit?.length ? (
              data.audit.map((a, i) => (
                <li key={i} className="border-b border-white/10 pb-2">
                  <p className="font-semibold">{a.action}</p>
                  <p className="text-xs text-white/70">{a.created_at}</p>
                </li>
              ))
            ) : (
              <p className="text-white/60">No audit entries</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderFaculty = (data: FacultySummary) => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Upcoming Classes" value={data.upcomingClasses?.length || 0} />
        <Card title="Reminders" value={data.reminders?.length || 0} />
        <Card title="At-risk Students" value={data.atRiskStudents?.length || 0} />
      </div>

      <div className="glow-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-white/80 mb-2">
          <Calendar size={18} /> Next Classes
        </div>
        <ul className="space-y-2 text-white">
          {data.upcomingClasses?.length ? (
            data.upcomingClasses.map((c, i) => (
              <li key={i} className="border-b border-white/10 pb-2">
                <p className="font-semibold">
                  {c.coursecode} — {c.topic || "Session"}
                </p>
                <p className="text-xs text-white/70">
                  {c.sessiondate} • {c.divisionname}
                </p>
              </li>
            ))
          ) : (
            <p className="text-white/60">No upcoming classes</p>
          )}
        </ul>
      </div>
    </div>
  );

  const renderStudent = (data: StudentSummary) => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Attendance"
          value={`${data.attendance.percentage}%`}
          hint={`${data.attendance.totalSessions} sessions`}
        />
        <Card title="Upcoming Classes" value={data.timetable?.length || 0} />
        <Card title="Payments" value={data.payments?.reduce((sum, p) => sum + (p.count || 0), 0)} />
      </div>

      {data.attendance.atRisk && (
        <div className="glow-card p-4 rounded-2xl text-amber-300 flex items-center gap-2">
          <AlertTriangle size={18} /> Attendance below 75%. Please review your sessions.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glow-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Calendar size={18} /> Upcoming Classes
          </div>
          <ul className="space-y-2 text-white">
            {data.timetable?.length ? (
              data.timetable.map((t, i) => (
                <li key={i} className="border-b border-white/10 pb-2">
                  <p className="font-semibold">{t.coursecode}</p>
                  <p className="text-xs text-white/70">
                    {t.sessiondate} • {t.starttime} - {t.endtime} • {t.roomno || "TBD"}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-white/60">No upcoming classes</p>
            )}
          </ul>
        </div>
        <div className="glow-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Bell size={18} /> Reminders
          </div>
          <ul className="space-y-2 text-white">
            {data.reminders?.length ? (
              data.reminders.map((r, i) => (
                <li key={i} className="border-b border-white/10 pb-2">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-white/70">
                    {r.date} — {r.note}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-white/60">No reminders</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="glow-page min-h-screen p-6 md:p-10 text-white">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap size={32} className="text-blue-400" />
        <div>
          <p className="text-sm text-white/70">Welcome back</p>
          <h1 className="text-3xl font-bold">Dashboard — {role}</h1>
        </div>
      </div>

      {role === "admin" && renderAdmin(summary as AdminSummary)}
      {(role === "faculty" || role === "staff") && renderFaculty(summary as FacultySummary)}
      {role === "student" && renderStudent(summary as StudentSummary)}
    </div>
  );
}
