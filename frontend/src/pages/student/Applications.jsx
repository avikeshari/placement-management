import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";
import toast from "react-hot-toast";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/applications/my");
      setApplications(response.data.applications || []);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load applications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const withdrawApplication = async (application) => {
    const confirmed = window.confirm(
      `Withdraw your application for ${application.job?.title || "this job"}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setWithdrawing(application._id);
      await api.delete(`/applications/${application._id}/withdraw`);
      toast.success("Application withdrawn successfully");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to withdraw application."));
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading) return <Loader text="Loading applications..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!applications.length) return <EmptyState title="No applications" message="Apply to a job to start tracking your placement journey." />;

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Applications</h1>
      <div className="space-y-5">
        {applications.map((application) => (
          <article key={application._id} className="bg-white border rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-xl">{application.job?.title || "Job"}</h2>
                <p className="text-slate-500">{application.job?.company?.name || "Company"}</p>
                <p className="text-sm text-slate-500 mt-2">Applied {new Date(application.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <span className="capitalize h-fit px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">{application.status}</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-sm">
              <div><p className="text-slate-500">Location</p><p className="font-semibold mt-1">{application.job?.location || "Not specified"}</p></div>
              <div><p className="text-slate-500">Salary / Package</p><p className="font-semibold mt-1">{application.job?.salary ?? "Not specified"}</p></div>
              <div><p className="text-slate-500">Minimum CGPA</p><p className="font-semibold mt-1">{application.job?.minimumCGPA ?? "Not specified"}</p></div>
              <div><p className="text-slate-500">Deadline</p><p className="font-semibold mt-1">{application.job?.deadline ? new Date(application.job.deadline).toLocaleDateString("en-IN") : "Not specified"}</p></div>
            </div>

            <div className="mt-5">
              <p className="font-semibold">Required Skills</p>
              <p className="text-slate-600 mt-1">{application.job?.requiredSkills?.join(", ") || "Not specified"}</p>
            </div>

            <div className="mt-5">
              <p className="font-semibold">Job Description</p>
              <p className="text-slate-600 whitespace-pre-line mt-1">{application.job?.description || "No description available."}</p>
            </div>

            {application.status === "selected" && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-800">Placement Offer</p>
                <p className="text-sm text-emerald-700 mt-1">Status: {application.offerStatus || "pending"}</p>
                {(!application.offerStatus || application.offerStatus === "pending") && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={async()=>{try{await api.patch(`/applications/${application._id}/offer`,{response:"accepted"});toast.success("Offer accepted");await load();}catch(e){toast.error(getErrorMessage(e,"Unable to accept offer."));}}} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Accept Offer</button>
                    <button onClick={async()=>{try{await api.patch(`/applications/${application._id}/offer`,{response:"declined"});toast.success("Offer declined");await load();}catch(e){toast.error(getErrorMessage(e,"Unable to decline offer."));}}} className="bg-red-600 text-white px-4 py-2 rounded-lg">Decline Offer</button>
                  </div>
                )}
              </div>
            )}

            {application.resume?.downloadUrl && (
              <a href={application.resume.downloadUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 text-blue-600 font-medium">Download submitted resume</a>
            )}

            {["applied", "shortlisted", "interview"].includes(application.status) && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => withdrawApplication(application)}
                  disabled={withdrawing === application._id}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {withdrawing === application._id ? "Withdrawing..." : "Withdraw Application"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applications;
