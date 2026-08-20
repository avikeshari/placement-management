import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(null);

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

  const respond = async (interview, response) => {
    const action = response === "accepted" ? "accept" : "decline";
    const confirmed = window.confirm(`Are you sure you want to ${action} this interview?`);
    if (!confirmed) return;

    let message = "";
    if (response === "declined") {
      message = window.prompt(
        "Optional message to the company:",
        "I am unable to attend this interview. Thank you for the opportunity."
      ) || "I am unable to attend this interview. Thank you for the opportunity.";
    } else {
      message = "I accept the interview invitation and will attend at the scheduled time.";
    }

    try {
      setResponding(interview._id);
      await api.patch(`/interviews/${interview._id}/respond`, { response, message });
      toast.success(response === "accepted" ? "Interview accepted" : "Interview declined");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update interview response."));
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return <Loader text="Loading interviews..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
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
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          My Interviews
        </h1>
        <p className="text-slate-500 mt-2">
          View interview details and messages from companies.
        </p>
      </div>

      <div className="space-y-4">
        {interviews.map((interview) => (
          <article
            key={interview._id}
            className="bg-white border rounded-2xl p-6"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {interview.application?.job?.title ||
                    "Placement Interview"}
                </h2>

                <p className="text-slate-500 mt-1">
                  {interview.company?.name ||
                    "Company"}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium capitalize">
                {interview.status || "scheduled"}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <p className="text-slate-500">
                  Interview Date
                </p>
                <p className="font-semibold mt-1">
                  {new Date(
                    interview.scheduledAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Interview Time
                </p>
                <p className="font-semibold mt-1">
                  {new Date(
                    interview.scheduledAt
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Mode
                </p>
                <p className="font-semibold capitalize mt-1">
                  {interview.mode}
                </p>
              </div>

              {interview.mode === "offline" && (
                <div>
                  <p className="text-slate-500">
                    Location
                  </p>
                  <p className="font-semibold mt-1">
                    {interview.location || "-"}
                  </p>
                </div>
              )}
            </div>

            {interview.message && (
              <div className="mt-5 bg-slate-50 border rounded-xl p-4">
                <p className="font-semibold text-sm">
                  Message from Company
                </p>
                <p className="text-sm text-slate-600 whitespace-pre-line mt-2">
                  {interview.message}
                </p>
              </div>
            )}

            {interview.studentResponseMessage && interview.studentResponse !== "pending" && (
              <div className="mt-5 bg-slate-50 border rounded-xl p-4">
                <p className="font-semibold text-sm">Your Response</p>
                <p className="text-sm text-slate-600 whitespace-pre-line mt-2">
                  {interview.studentResponseMessage}
                </p>
              </div>
            )}

            {interview.status === "scheduled" && interview.studentResponse === "pending" && (
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  type="button"
                  disabled={responding === interview._id}
                  onClick={() => respond(interview, "accepted")}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {responding === interview._id ? "Updating..." : "Accept Interview"}
                </button>
                <button
                  type="button"
                  disabled={responding === interview._id}
                  onClick={() => respond(interview, "declined")}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  Decline Interview
                </button>
              </div>
            )}

            {interview.application?._id && (
              <Link
                to={`/messages?application=${interview.application._id}`}
                className="inline-flex mt-5 mr-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Message Company
              </Link>
            )}

            {interview.status === "scheduled" && interview.studentResponse === "accepted" && interview.mode === "online" && interview.meetingUrl && (
              <Link
                to={`/interview-room/${interview._id}`}
                className="inline-flex mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Join Interview
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Interviews;
