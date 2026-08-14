import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/interviews/my"
      );

      setInterviews(
        response.data.interviews || []
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to load interviews."
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
    return <Loader text="Loading interviews..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!interviews.length) {
    return (
      <EmptyState
        title="No interviews"
        message="Scheduled interviews will appear here."
      />
    );
  }

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Interviews
      </h1>

      <div className="space-y-4">
        {interviews.map((interview) => (
          <article
            key={interview._id}
            className="bg-white border rounded-xl p-5"
          >
            <h2 className="text-lg font-semibold">
              {interview.student?.name}
            </h2>

            <p className="text-slate-500">
              {interview.student?.email}
            </p>

            <p className="mt-3">
              {new Date(
                interview.scheduledAt
              ).toLocaleString()}
            </p>

            {interview.meetingUrl && (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-blue-600"
              >
                Join Video Interview
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Interviews;
