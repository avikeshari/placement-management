import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/applications/my");
      setApplications(response.data.applications || []);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load applications."));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader text="Loading applications..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!applications.length) return <EmptyState title="No applications" message="Apply to a job to start tracking your placement journey." />;

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Applications</h1>
      <div className="space-y-4">
        {applications.map((application) => (
          <article key={application._id} className="bg-white border rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-xl">{application.job?.title || "Job"}</h2>
                <p className="text-slate-500">{application.job?.company?.name || "Company"}</p>
                <p className="text-sm text-slate-500 mt-2">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                {application.job?.deadline && <p className="text-sm text-slate-500">Deadline: {new Date(application.job.deadline).toLocaleDateString()}</p>}
              </div>
              <span className="capitalize h-fit px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">{application.status}</span>
            </div>
            {application.resume?.downloadUrl && (
              <a href={application.resume.downloadUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-blue-600 font-medium">Download submitted resume</a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applications;
