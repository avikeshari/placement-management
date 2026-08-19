import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

const STATUS_OPTIONS = [
  "applied",
  "shortlisted",
  "interview",
  "selected",
  "rejected"
];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/applications");
      setApplications(response.data?.applications || []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to load applications."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep this hook before the conditional returns so the hook order
  // remains the same during loading, error, and loaded renders.
  const filtered = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    return applications.filter((item) => {
      const text = [
        item.student?.name,
        item.student?.email,
        item.job?.title,
        item.job?.location,
        item.job?.company?.name,
        item.job?.company?.email
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText || text.includes(searchText);

      const matchesStatus =
        status === "all" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [applications, query, status]);

  if (loading) {
    return <Loader text="Loading applications..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Applications
          </h1>
          <p className="text-slate-500 mt-2">
            Monitor the complete application pipeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, job or company"
              className="w-full border rounded-lg pl-10 pr-3 py-2.5 bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2.5 bg-white"
          >
            <option value="all">All status</option>
            {STATUS_OPTIONS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState
          title="No applications found"
          message="Try a different search or status filter."
        />
      ) : (
        <div className="bg-white border rounded-2xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Student",
                  "Job",
                  "Company",
                  "Status",
                  "Applied"
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-4 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item._id}
                  className="border-t"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">
                      {item.student?.name || "Unknown student"}
                    </p>
                    <p className="text-slate-500">
                      {item.student?.email || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {item.job?.title || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {item.job?.company?.name || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="capitalize">
                      {item.status || "applied"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Applications;
