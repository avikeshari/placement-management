import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        title="No interviews scheduled"
        message="Your scheduled interviews will appear here."
      />
    );
  }

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        My Interviews
      </h1>

      <div className="space-y-4">
        {interviews.map((interview) => (
          <article
            key={interview._id}
            className="bg-white border rounded-xl p-5"
          >
            <h2 className="text-xl font-semibold">
              {interview.application?.job?.title ||
                "Placement Interview"}
            </h2>

            <p className="text-slate-500 mt-2">
              {new Date(
                interview.scheduledAt
              ).toLocaleString()}
            </p>

            <p className="capitalize mt-2">
              Mode: {interview.mode}
            </p>

            {interview.mode === "online" &&
              interview.meetingUrl && (
                <a
                  href={interview.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Join Interview
                </a>
              )}

            {interview.mode === "offline" && (
              <p className="mt-3 text-slate-600">
                Location: {interview.location}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Interviews;
