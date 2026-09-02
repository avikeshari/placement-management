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
  const [cancelling, setCancelling] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

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

  const cancelInterview = async (interview) => {
    setCancelTarget(interview);
  };

  const doCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(cancelTarget._id);
      await api.patch(`/interviews/${cancelTarget._id}/cancel`);
      toast.success("Interview cancelled and candidate notified");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel interview."));
    } finally {
      setCancelling(null);
      setCancelTarget(null);
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
        {interviews.map((interview) => (
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
                  onClick={() => cancelInterview(interview)}
                  disabled={cancelling === interview._id}
                  className="inline-flex bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {cancelling === interview._id ? "Cancelling..." : "Cancel Interview"}
                </button>
              )}
            </div>

            {interview.status === "scheduled" && <button type="button" onClick={async()=>{try{await api.patch(`/interviews/${interview._id}/complete`);toast.success("Interview marked completed");await load()}catch(e){toast.error(getErrorMessage(e,"Unable to complete interview."))}}} className="mt-4 border px-4 py-2 rounded-lg">Mark Completed</button>}
            {interview.status === "completed" && <FeedbackForm interviewId={interview._id} onSaved={load} />}

            {interview.mode === "offline" && (
              <p className="mt-5 text-slate-600">
                <strong>Location:</strong>{" "}
                {interview.location || "-"}
              </p>
            )}
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel interview?"
        message={cancelTarget ? `Cancel the interview with ${cancelTarget.student?.name || "this candidate"}?` : ""}
        confirmText="Cancel Interview"
        danger
        loading={!!cancelling}
        onConfirm={doCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </section>
  );
};

const FeedbackForm = ({ interviewId, onSaved }) => {
  const [feedback, setFeedback] = useState({
    rating: "",
    recommendation: "",
    technicalSkills: "",
    communication: "",
    comments: ""
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => setFeedback((prev) => ({ ...prev, [field]: event.target.value }));
  const disabled = saving || !feedback.rating;

  const save = async () => {
    try {
      setSaving(true);
      await api.patch(`/interviews/${interviewId}/feedback`, {
        rating: Number(feedback.rating),
        recommendation: feedback.recommendation,
        technicalSkills: feedback.technicalSkills,
        communication: feedback.communication,
        comments: feedback.comments
      });
      toast.success("Feedback saved");
      await onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save feedback."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border rounded-xl p-4">
      <p className="font-semibold">Interview Feedback</p>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label htmlFor={`rating-${interviewId}`} className="block text-xs font-medium text-slate-600 mb-1">Rating (1-5)</label>
          <input id={`rating-${interviewId}`} type="number" min="1" max="5" value={feedback.rating} onChange={handleChange("rating")} className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div>
          <label htmlFor={`recommendation-${interviewId}`} className="block text-xs font-medium text-slate-600 mb-1">Recommendation</label>
          <select id={`recommendation-${interviewId}`} value={feedback.recommendation} onChange={handleChange("recommendation")} className="border rounded-lg px-3 py-2 w-full">
            <option value="">Select recommendation</option>
            <option value="hire">Hire</option>
            <option value="hold">Hold</option>
            <option value="reject">Reject</option>
          </select>
        </div>
        <div>
          <label htmlFor={`technical-${interviewId}`} className="block text-xs font-medium text-slate-600 mb-1">Technical skills</label>
          <input id={`technical-${interviewId}`} type="text" value={feedback.technicalSkills} onChange={handleChange("technicalSkills")} className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div>
          <label htmlFor={`communication-${interviewId}`} className="block text-xs font-medium text-slate-600 mb-1">Communication</label>
          <input id={`communication-${interviewId}`} type="text" value={feedback.communication} onChange={handleChange("communication")} className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`comments-${interviewId}`} className="block text-xs font-medium text-slate-600 mb-1">Comments</label>
          <textarea id={`comments-${interviewId}`} rows={2} value={feedback.comments} onChange={handleChange("comments")} className="md:col-span-2 w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={disabled}
        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white px-4 py-2 rounded-lg"
      >
        {saving ? "Saving..." : "Save Feedback"}
      </button>
    </div>
  );
};

export default Interviews;
