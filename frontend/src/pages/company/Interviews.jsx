import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmDialog from "../../components/ConfirmDialog";
import getErrorMessage from "../../utils/getErrorMessage";

const defaultFeedback = { rating: "", recommendation: "hold", technicalSkills: "", communication: "", comments: "" };

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);

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

  const cancelInterview = async () => {
    const interview = confirmDialog?.interview;
    if (!interview) return;
    try {
      setCancelling(interview._id);
      await api.patch(`/interviews/${interview._id}/cancel`);
      toast.success("Interview cancelled and candidate notified");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel interview."));
    } finally {
      setCancelling(null);
      setConfirmDialog(null);
    }
  };

  const completeInterview = async () => {
    const interview = confirmDialog?.interview;
    if (!interview) return;
    try {
      setCompleting(interview._id);
      await api.patch(`/interviews/${interview._id}/complete`);
      toast.success("Interview marked completed");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to complete interview."));
    } finally {
      setCompleting(null);
      setConfirmDialog(null);
    }
  };

  const updateFeedback = (interviewId, field, value) => {
    setFeedback((prev) => ({ ...prev, [interviewId]: { ...(prev[interviewId] || defaultFeedback), [field]: value } }));
  };

  const saveFeedback = async (interview) => {
    const values = feedback[interview._id] || defaultFeedback;
    const rating = Number(values.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error("Rating must be a whole number between 1 and 5");
      return;
    }
    if (values.recommendation && !["hire", "hold", "reject"].includes(values.recommendation)) {
      toast.error("Recommendation must be hire, hold or reject");
      return;
    }
    try {
      await api.patch(`/interviews/${interview._id}/feedback`, {
        rating,
        recommendation: values.recommendation,
        technicalSkills: values.technicalSkills,
        communication: values.communication,
        comments: values.comments
      });
      toast.success("Feedback saved");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save feedback."));
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
        title="No interviews"
        message="Scheduled interviews will appear here."
      />
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Interviews
        </h1>
        <p className="text-slate-500 mt-2">
          View scheduled candidate interviews.
        </p>
      </div>

      <div className="space-y-4">
        {interviews.map((interview) => {
          const feedbackValues = feedback[interview._id] || defaultFeedback;
          return (
            <article
              key={interview._id}
              className="bg-white border rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {interview.student?.name}
                  </h2>

                  <p className="text-slate-500">
                    {interview.student?.email}
                  </p>

                  <p className="font-medium mt-3">
                    {interview.application?.job?.title ||
                      "Placement Interview"}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium capitalize">
                  {interview.status || "scheduled"}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-5 text-sm">
                <div>
                  <p className="text-slate-500">
                    Date
                  </p>
                  <p className="font-semibold mt-1">
                    {new Date(
                      interview.scheduledAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Time
                  </p>
                  <p className="font-semibold mt-1">
                    {new Date(
                      interview.scheduledAt
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
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
              </div>

              {interview.message && (
                <div className="mt-5 bg-slate-50 border rounded-xl p-4">
                  <p className="font-semibold text-sm">
                    Candidate Message
                  </p>
                  <p className="text-sm text-slate-600 whitespace-pre-line mt-2">
                    {interview.message}
                  </p>
                </div>
              )}

              {interview.studentResponseMessage && (
                <div className="mt-5 bg-slate-50 border rounded-xl p-4">
                  <p className="font-semibold text-sm">Student Response</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line mt-2">
                    {interview.studentResponseMessage}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                {interview.application?._id && (
                  <Link
                    to={`/messages?application=${interview.application._id}`}
                    className="inline-flex bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium"
                  >
                    Message Student
                  </Link>
                )}

                {interview.mode === "online" && interview.meetingUrl && interview.status === "scheduled" && (
                  <Link
                    to={`/interview-room/${interview._id}`}
                    className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
                  >
                    Open Meeting Link
                  </Link>
                )}

                {interview.status === "scheduled" && (
                  <button
                    type="button"
                    onClick={() => setConfirmDialog({ type: "cancel", interview })}
                    disabled={cancelling === interview._id}
                    className="inline-flex bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                  >
                    {cancelling === interview._id ? "Cancelling..." : "Cancel Interview"}
                  </button>
                )}
              </div>

              {interview.status === "scheduled" && (
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ type: "complete", interview })}
                  disabled={completing === interview._id}
                  className="mt-4 border px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {completing === interview._id ? "Completing..." : "Mark Completed"}
                </button>
              )}

              {interview.status === "completed" && (
                <div className="mt-4 border rounded-xl p-4">
                  <p className="font-semibold">Interview Feedback</p>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <label>
                      <span className="sr-only">Rating 1 to 5</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="1"
                        placeholder="Rating 1-5"
                        value={feedbackValues.rating}
                        onChange={(e) => updateFeedback(interview._id, "rating", e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                      />
                    </label>
                    <label>
                      <span className="sr-only">Recommendation</span>
                      <select
                        value={feedbackValues.recommendation}
                        onChange={(e) => updateFeedback(interview._id, "recommendation", e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                      >
                        <option value="hire">Recommendation: Hire</option>
                        <option value="hold">Recommendation: Hold</option>
                        <option value="reject">Recommendation: Reject</option>
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Technical skills feedback</span>
                      <input
                        placeholder="Technical skills feedback"
                        value={feedbackValues.technicalSkills}
                        onChange={(e) => updateFeedback(interview._id, "technicalSkills", e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                      />
                    </label>
                    <label>
                      <span className="sr-only">Communication feedback</span>
                      <input
                        placeholder="Communication feedback"
                        value={feedbackValues.communication}
                        onChange={(e) => updateFeedback(interview._id, "communication", e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                      />
                    </label>
                    <label className="md:col-span-2">
                      <span className="sr-only">Comments</span>
                      <textarea
                        placeholder="Comments"
                        value={feedbackValues.comments}
                        onChange={(e) => updateFeedback(interview._id, "comments", e.target.value)}
                        maxLength={2000}
                        className="border rounded-lg px-3 py-2 w-full"
                      />
                    </label>
                  </div>
                  <button
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => saveFeedback(interview)}
                  >
                    Save Feedback
                  </button>
                </div>
              )}

              {interview.mode === "offline" && (
                <p className="mt-5 text-slate-600">
                  <strong>Location:</strong>{" "}
                  {interview.location || "-"}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.type === "cancel" ? "Cancel Interview" : "Complete Interview"}
        message={confirmDialog?.type === "cancel"
          ? `Cancel the interview with ${confirmDialog?.interview?.student?.name || "this candidate"}? The candidate will be notified.`
          : "Mark this interview as completed?"}
        confirmLabel={confirmDialog?.type === "cancel" ? "Cancel Interview" : "Complete"}
        danger={confirmDialog?.type === "cancel"}
        loading={confirmDialog?.type === "cancel" ? cancelling !== null : completing !== null}
        onConfirm={confirmDialog?.type === "cancel" ? cancelInterview : completeInterview}
        onCancel={() => setConfirmDialog(null)}
      />
    </section>
  );
};

export default Interviews;