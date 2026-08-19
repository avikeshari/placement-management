import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Award,
  UserCheck,
  TrendingUp
} from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load admin dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader text="Loading admin dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const cards = [
    ["Students", stats.students, Users],
    ["Companies", stats.companies, Building2],
    ["Active Jobs", stats.openJobs, BriefcaseBusiness],
    ["Applications", stats.applications, FileText],
    ["Interviews", stats.interviews, CalendarDays],
    ["Selected", stats.selected, Award],
    ["Placements", stats.placements, UserCheck],
    ["Placement Rate", `${stats.placementRate}%`, TrendingUp]
  ];

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">Monitor the complete placement lifecycle.</p>
        </div>
        <Link to="/admin/analytics" className="text-blue-600 font-medium">View detailed analytics →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-slate-500">{label}</p>
              <Icon size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold mt-3 text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-slate-500">Average Salary</p>
          <p className="text-2xl font-bold mt-2">₹{Number(stats.averageSalary || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-slate-500">Highest Salary</p>
          <p className="text-2xl font-bold mt-2">₹{Number(stats.highestSalary || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-slate-500">Rejected Applications</p>
          <p className="text-2xl font-bold mt-2">{stats.rejected}</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
