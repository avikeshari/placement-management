import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmDialog from "../../components/ConfirmDialog";
import getErrorMessage from "../../utils/getErrorMessage";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [declineMessage, setDeclineMessage] = useState(
    "I am unable to attend this interview. Thank you for the opportunity."
  );

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
    let message = "";
    if (response === "declined") {
      message = declineMessage.trim();
    } else {
      message = "I accept the interview invitation and will attend at the scheduled time.";
    }

    try {
      setResponding(interview._id);
      await api.patch(`/interviews/${interview._id}/respond`, { response, message });
      toast.success(response === "accepted" ? "Interview accepted" : "Interview declined");
      setDeclining(null);
      setAccepting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update interview response."));
    } finally {
      setResponding(null);
    }
  };

  const openDecline = (interview) => {
    setDeclineMessage("I am unable to attend this interview. Thank you for the opportunity.");
    setDeclining(interview);
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
                  onClick={() => setAccepting(interview)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {responding === interview._id ? "Updating..." : "Accept Interview"}
                </button>
                <button
                  type="button"
                  disabled={responding === interview._id}
                  onClick={() => openDecline(interview)}
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

      {declining && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setDeclining(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Decline interview</h3>
            <p className="text-sm text-slate-500 mt-1">Add an optional message to the company.</p>
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              rows={4}
              className="border rounded-lg p-3 w-full mt-4"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeclining(null)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button
                onClick={() => respond(declining, "declined")}
                disabled={responding === declining._id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {responding === declining._id ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!accepting}
        title="Accept interview?"
        message="Are you sure you want to accept this interview?"
        confirmText="Accept"
        loading={responding === accepting?._id}
        onConfirm={() => accepting && respond(accepting, "accepted")}
        onCancel={() => setAccepting(null)}
      />
    </section>
  );
};

export default Interviews;
