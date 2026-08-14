import { useLocation, useNavigate } from "react-router-dom";

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const meetingUrl =
    location.state?.meetingUrl;

  if (!meetingUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Interview room unavailable
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4 bg-slate-950">
      <iframe
        src={meetingUrl}
        title="Video Interview"
        allow="camera; microphone; fullscreen; display-capture"
        className="w-full h-full rounded-xl border-0"
      />
    </div>
  );
};

export default InterviewRoom;
