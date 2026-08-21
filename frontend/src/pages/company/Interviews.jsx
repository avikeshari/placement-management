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
  const [cancelling, setCancelling] = useState(null);

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
    const confirmed = window.confirm(
      `Cancel the interview with ${interview.student?.name || "this candidate"}?`
    );
    if (!confirmed) return;

    try {
      setCancelling(interview._id);
      await api.patch(`/interviews/${interview._id}/cancel`);
      toast.success("Interview cancelled and candidate notified");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel interview."));
    } finally {
      setCancelling(null);
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
            {interview.status === "completed" && <div className="mt-4 border rounded-xl p-4"><p className="font-semibold">Interview Feedback</p><div className="grid md:grid-cols-2 gap-3 mt-3"><input id={`rating-${interview._id}`} type="number" min="1" max="5" placeholder="Rating 1-5" className="border rounded-lg px-3 py-2"/><input id={`recommendation-${interview._id}`} placeholder="Recommendation: hire / hold / reject" className="border rounded-lg px-3 py-2"/><input id={`technical-${interview._id}`} placeholder="Technical skills feedback" className="border rounded-lg px-3 py-2"/><input id={`communication-${interview._id}`} placeholder="Communication feedback" className="border rounded-lg px-3 py-2"/><textarea id={`comments-${interview._id}`} placeholder="Comments" className="md:col-span-2 border rounded-lg px-3 py-2"/></div><button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={async()=>{const v=id=>document.getElementById(`${id}-${interview._id}`)?.value;try{await api.patch(`/interviews/${interview._id}/feedback`,{rating:v('rating'),recommendation:v('recommendation'),technicalSkills:v('technical'),communication:v('communication'),comments:v('comments')});toast.success("Feedback saved");await load()}catch(e){toast.error(getErrorMessage(e,"Unable to save feedback."))}}}>Save Feedback</button></div>}

            {interview.mode === "offline" && (
              <p className="mt-5 text-slate-600">
                <strong>Location:</strong>{" "}
                {interview.location || "-"}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Interviews;
