import {
  useCallback,
  useEffect,
  useState
} from "react";
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

      const response = await api.get(
        "/admin/stats"
      );

      setStats(response.data.stats);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to load analytics."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loader text="Loading analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const cards = [
    ["Students", stats.students],
    ["Companies", stats.companies],
    ["Jobs", stats.jobs],
    ["Applications", stats.applications],
    ["Interviews", stats.interviews],
    ["Selected", stats.selected]
  ];

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="bg-white border rounded-2xl p-6"
          >
            <p className="text-slate-500">
              {label}
            </p>

            <p className="text-3xl font-bold mt-2">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
