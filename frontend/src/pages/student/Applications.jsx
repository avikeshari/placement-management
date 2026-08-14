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

      const response = await api.get(
        "/applications/my"
      );

      setApplications(
        response.data.applications || []
      );
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

  if (loading) {
    return <Loader text="Loading applications..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!applications.length) {
    return (
      <EmptyState
        title="No applications"
        message="You have not applied for any jobs yet."
      />
    );
  }

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        My Applications
      </h1>

      <div className="space-y-4">
        {applications.map((application) => (
          <article
            key={application._id}
            className="bg-white border rounded-xl p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg">
                  {application.job?.title}
                </h2>

                <p className="text-slate-500">
                  {application.job?.location ||
                    "Location not specified"}
                </p>

                <p className="text-sm text-slate-500 mt-2">
                  Applied on{" "}
                  {new Date(
                    application.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              <span className="capitalize px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {application.status}
              </span>
            </div>

            {application.resume?.url && (
              <a
                href={application.resume.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-blue-600 text-sm"
              >
                View submitted resume
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applications;
