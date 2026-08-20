import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import getErrorMessage from "../utils/getErrorMessage";

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/interviews/${interviewId}/access`);
        setInterview(response.data.interview);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to access this interview."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [interviewId]);

  if (loading) return <Loader text="Checking interview access..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border rounded-2xl p-8 max-w-xl w-full text-center shadow-sm">
        <h1 className="text-2xl font-bold">Online Interview</h1>
        <p className="text-slate-500 mt-2">
          Access to this meeting was verified for your account.
        </p>
        {interview?.job?.title && (
          <p className="font-semibold mt-5">{interview.job.title}</p>
        )}
        <p className="text-sm text-slate-500 mt-2">
          {new Date(interview.scheduledAt).toLocaleString("en-IN", {
            dateStyle: "long",
            timeStyle: "short"
          })}
        </p>
        <a
          href={interview.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          Join Interview
        </a>
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 text-slate-600 hover:text-slate-900"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;
