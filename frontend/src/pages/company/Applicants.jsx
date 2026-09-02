import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Applicants = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/applications/job/${jobId}`
      );

      setApplications(data.applications || []);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to load applicants."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);

      await api.patch(
        `/applications/${id}/status`,
        { status }
      );

      toast.success(
        "Application status updated"
      );

      await load();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to update status."
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  const viewStudent = async (userId) => {
    try {
      const { data } = await api.get(
        `/profile/student/${userId}`
      );

      setStudentProfile(data.profile);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to load student profile."
        )
      );
    }
  };

  const viewResume = async (application) => {
    try {
      setResumeLoading(application._id);
      const response = await api.get(
        `/profile/student/${application.student?._id}/resume?applicationId=${application._id}`,
        { responseType: "blob" }
      );
      const contentType = response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to open the student's resume."));
    } finally {
      setResumeLoading(null);
    }
  };

  const openSchedule = (application) => {
    setSchedule({
      applicationId: application._id,
      studentName:
        application.student?.name || "Candidate",
      jobTitle: application.job?.title || "Placement Interview",
      scheduledDate: "",
      scheduledTime: "",
      mode: "online",
      meetingUrl: "",
      location: ""
    });
  };

  const submitInterview = async (event) => {
    event.preventDefault();
    if (scheduling) return;

    if (!schedule?.scheduledDate || !schedule?.scheduledTime) {
      toast.error(
        "Please enter the interview date and time."
      );
      return;
    }

    if (
      schedule.mode === "online" &&
      !schedule.meetingUrl.trim()
    ) {
      toast.error(
        "Please enter the online meeting link."
      );
      return;
    }

    if (
      schedule.mode === "offline" &&
      !schedule.location.trim()
    ) {
      toast.error(
        "Please enter the interview location."
      );
      return;
    }

    const scheduledAt = new Date(
      `${schedule.scheduledDate}T${schedule.scheduledTime}`
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      toast.error(
        "Please enter a valid interview date and time."
      );
      return;
    }

    if (scheduledAt <= new Date()) {
      toast.error(
        "Interview must be scheduled for a future date and time."
      );
      return;
    }

    try {
      setScheduling(true);
      await api.post("/interviews", {
        applicationId: schedule.applicationId,
        scheduledAt: scheduledAt.toISOString(),
        mode: schedule.mode,
        meetingUrl:
          schedule.mode === "online"
            ? schedule.meetingUrl.trim()
            : "",
        location:
          schedule.mode === "offline"
            ? schedule.location.trim()
            : ""
      });

      toast.success(
        "Interview scheduled and candidate notified"
      );

      setSchedule(null);
      load();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to schedule interview."
        )
      );
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return <Loader text="Loading applicants..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
  }

  if (!applications.length) {
    return (
      <EmptyState
        title="No applicants"
        message="No students have applied for this job yet."
      />
    );
  }

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Applicants
      </h1>

      <div className="space-y-4">
        {applications.map((application) => (
          <article
            key={application._id}
            className="bg-white border rounded-2xl p-5"
          >
            <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {application.student?.name}
                </h2>

                <p className="text-slate-500">
                  {application.student?.email}
                </p>

                <p className="capitalize mt-2">
                  Status: {application.status}
                </p>

                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={() =>
                      viewStudent(
                        application.student?._id
                      )
                    }
                    className="text-blue-600"
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => viewResume(application)}
                    disabled={resumeLoading === application._id}
                    className="text-blue-600 disabled:text-slate-400"
                  >
                    {resumeLoading === application._id ? "Opening Resume..." : "View Resume"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-start">
                {application.status === "interview" && (
                  <Link
                    to={`/messages?application=${application._id}`}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  >
                    Message Student
                  </Link>
                )}

                {application.status === "applied" && (
                  <>
                    <button
                      disabled={
                        updating === application._id
                      }
                      onClick={() =>
                        updateStatus(
                          application._id,
                          "shortlisted"
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Shortlist
                    </button>

                    <button
                      disabled={
                        updating === application._id
                      }
                      onClick={() =>
                        updateStatus(
                          application._id,
                          "rejected"
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}

                {[
                  "shortlisted",
                  "selected"
                ].includes(application.status) && (
                  <>
                    <button
                      type="button"
                      disabled={updating === application._id}
                      onClick={() => openSchedule(application)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule Interview
                    </button>

                    {application.status === "shortlisted" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            application._id,
                            "selected"
                          )
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        Select
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {studentProfile && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setStudentProfile(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2 className="text-xl font-bold">
              {studentProfile.user?.name}
            </h2>

            <p className="text-slate-500">
              {studentProfile.user?.email}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <p>
                <b>College:</b>{" "}
                {studentProfile.college || "-"}
              </p>
              <p>
                <b>Course:</b>{" "}
                {studentProfile.course || "-"}
              </p>
              <p>
                <b>Branch:</b>{" "}
                {studentProfile.branch || "-"}
              </p>
              <p>
                <b>CGPA:</b>{" "}
                {studentProfile.cgpa ?? "-"}
              </p>
            </div>

            <p className="mt-4">
              <b>Skills:</b>{" "}
              {studentProfile.skills?.join(", ") || "-"}
            </p>

            <button
              onClick={() =>
                setStudentProfile(null)
              }
              className="mt-6 border px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {schedule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={submitInterview}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold">
                Schedule Interview
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                {schedule.studentName} · {schedule.jobTitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Interview Date
                </span>
                <input
                  required
                  type="date"
                  value={schedule.scheduledDate}
                  min={new Date()
                    .toISOString()
                    .split("T")[0]}
                  onChange={(event) =>
                    setSchedule({
                      ...schedule,
                      scheduledDate:
                        event.target.value
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2.5 mt-1"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Interview Time
                </span>
                <input
                  required
                  type="time"
                  value={schedule.scheduledTime}
                  onChange={(event) =>
                    setSchedule({
                      ...schedule,
                      scheduledTime:
                        event.target.value
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2.5 mt-1"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Interview Mode
              </span>
              <select
                value={schedule.mode}
                onChange={(event) =>
                  setSchedule({
                    ...schedule,
                    mode: event.target.value
                  })
                }
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              >
                <option value="online">
                  Online
                </option>
                <option value="offline">
                  Offline
                </option>
              </select>
            </label>

            {schedule.mode === "online" ? (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Online Meeting Link
                </span>
                <input
                  required
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={schedule.meetingUrl}
                  onChange={(event) =>
                    setSchedule({
                      ...schedule,
                      meetingUrl:
                        event.target.value
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2.5 mt-1"
                />
                <span className="text-xs text-slate-500 block mt-1">
                  Enter a Google Meet, Zoom, Teams, or other valid meeting URL.
                </span>
              </label>
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Interview Location
                </span>
                <input
                  required
                  placeholder="Interview room / office address"
                  value={schedule.location}
                  onChange={(event) =>
                    setSchedule({
                      ...schedule,
                      location:
                        event.target.value
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2.5 mt-1"
                />
              </label>
            )}

            <div className="bg-slate-50 border rounded-xl p-4">
              <p className="text-sm font-semibold">
                Message sent to candidate
              </p>

              <p className="text-sm text-slate-600 whitespace-pre-line mt-2">
                Dear {schedule.studentName},
                {"\n\n"}
                You have been selected for an interview for the {schedule.jobTitle} position.
                {"\n\n"}
                The interview details will be available in your Interviews section after scheduling.
                {"\n\n"}
                Please join the interview on time and keep the required documents ready.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() =>
                  setSchedule(null)
                }
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={scheduling}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-slate-400"
              >
                {scheduling ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default Applicants;
