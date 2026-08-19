import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const [studentProfile, setStudentProfile] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); const { data } = await api.get(`/applications/job/${jobId}`); setApplications(data.applications || []); }
    catch (error) { setError(getErrorMessage(error, "Unable to load applicants.")); }
    finally { setLoading(false); }
  }, [jobId]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { setUpdating(id); await api.patch(`/applications/${id}/status`, { status }); toast.success("Application status updated"); load(); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to update status.")); }
    finally { setUpdating(null); }
  };

  const viewStudent = async (userId) => {
    try { const { data } = await api.get(`/profile/student/${userId}`); setStudentProfile(data.profile); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to load student profile.")); }
  };

  const submitInterview = async (e) => {
    e.preventDefault();
    try { await api.post("/interviews", schedule); toast.success("Interview scheduled"); setSchedule(null); load(); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to schedule interview.")); }
  };

  if (loading) return <Loader text="Loading applicants..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!applications.length) return <EmptyState title="No applicants" message="No students have applied for this job yet." />;

  return <section><h1 className="text-2xl md:text-3xl font-bold mb-6">Applicants</h1><div className="space-y-4">
    {applications.map((application) => <article key={application._id} className="bg-white border rounded-2xl p-5"><div className="flex flex-col lg:flex-row lg:justify-between gap-5"><div><h2 className="text-lg font-semibold">{application.student?.name}</h2><p className="text-slate-500">{application.student?.email}</p><p className="capitalize mt-2">Status: {application.status}</p><div className="flex flex-wrap gap-3 mt-3"><button onClick={() => viewStudent(application.student?._id)} className="text-blue-600">View Profile</button>{application.resume?.downloadUrl && <a href={application.resume.downloadUrl} target="_blank" rel="noreferrer" className="text-blue-600">Download Resume</a>}</div></div><div className="flex flex-wrap gap-2 items-start">
      {application.status === "applied" && <><button disabled={updating === application._id} onClick={() => updateStatus(application._id, "shortlisted")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Shortlist</button><button disabled={updating === application._id} onClick={() => updateStatus(application._id, "rejected")} className="bg-red-600 text-white px-4 py-2 rounded-lg">Reject</button></>}
      {application.status === "shortlisted" && <><button onClick={() => setSchedule({ applicationId: application._id, scheduledAt: "", mode: "online", location: "" })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Schedule Interview</button><button onClick={() => updateStatus(application._id, "selected")} className="bg-green-600 text-white px-4 py-2 rounded-lg">Select</button></>}
    </div></div></article>)}
  </div>

  {studentProfile && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setStudentProfile(null)}><div className="bg-white rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}><h2 className="text-xl font-bold">{studentProfile.user?.name}</h2><p className="text-slate-500">{studentProfile.user?.email}</p><div className="grid grid-cols-2 gap-4 mt-5 text-sm"><p><b>College:</b> {studentProfile.college || "-"}</p><p><b>Course:</b> {studentProfile.course || "-"}</p><p><b>Branch:</b> {studentProfile.branch || "-"}</p><p><b>CGPA:</b> {studentProfile.cgpa ?? "-"}</p></div><p className="mt-4"><b>Skills:</b> {studentProfile.skills?.join(", ") || "-"}</p><button onClick={() => setStudentProfile(null)} className="mt-6 border px-4 py-2 rounded-lg">Close</button></div></div>}

  {schedule && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><form onSubmit={submitInterview} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"><h2 className="text-xl font-bold">Schedule Interview</h2><input required type="datetime-local" value={schedule.scheduledAt} onChange={(e) => setSchedule({ ...schedule, scheduledAt: e.target.value })} className="w-full border rounded-lg px-3 py-2.5"/><select value={schedule.mode} onChange={(e) => setSchedule({ ...schedule, mode: e.target.value })} className="w-full border rounded-lg px-3 py-2.5"><option value="online">Online</option><option value="offline">Offline</option></select>{schedule.mode === "offline" && <input required placeholder="Location" value={schedule.location} onChange={(e) => setSchedule({ ...schedule, location: e.target.value })} className="w-full border rounded-lg px-3 py-2.5"/>}<div className="flex gap-3"><button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Schedule</button><button type="button" onClick={() => setSchedule(null)} className="border px-4 py-2 rounded-lg">Cancel</button></div></form></div>}
  </section>;
};
export default Applicants;
