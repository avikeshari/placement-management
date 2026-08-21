import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import JobCard from "../../components/JobCard";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [academicRecord, setAcademicRecord] = useState(null);
  const [filters, setFilters] = useState({ q: "", location: "", minCGPA: "", skill: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const [jobsResponse, applicationsResponse, profileResponse, academicResponse] = await Promise.all([
        api.get("/jobs/student", { params }),
        api.get("/applications/my"),
        api.get("/profile/me"),
        api.get("/academic/me")
      ]);
      setJobs(jobsResponse.data.jobs || []);
      setApplications(applicationsResponse.data.applications || []);
      setProfile(profileResponse.data.profile || null);
      setAcademicRecord(academicResponse.data.record || null);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load jobs."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const appliedIds = useMemo(() => new Set(applications.map((a) => String(a.job?._id || a.job))), [applications]);

  const saveJob = async (jobId) => { try { await api.post(`/benchmark/saved-jobs/${jobId}`); toast.success("Job saved"); } catch (e) { toast.error(getErrorMessage(e,"Unable to save job")); } };
  const followCompany = async (companyId) => { if (!companyId) return; try { await api.post(`/benchmark/companies/${companyId}/follow`); toast.success("Company followed"); } catch (e) { toast.error(getErrorMessage(e,"Unable to follow company")); } };
  const saveSearch = async () => { try { const name = window.prompt("Name this search", filters.q || filters.skill || "My job search"); if (!name) return; await api.post("/benchmark/saved-searches", { name, query: filters, alertsEnabled: true }); toast.success("Search saved and alerts enabled"); } catch (e) { toast.error(getErrorMessage(e,"Unable to save search")); } };

  const applyForJob = async (jobId) => {
    const coverLetter = window.prompt("Optional cover letter (you can leave this blank):", "") || "";
    if (coverLetter.length > 5000) { toast.error("Cover letter must be 5000 characters or fewer"); return; }
    try {
      setApplyingId(jobId);
      await api.post(`/applications/${jobId}`, { coverLetter });
      toast.success("Application submitted successfully");
      setApplications((prev) => [...prev, { job: jobId, status: "applied" }]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Application failed"));
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <Loader text="Loading opportunities..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Find Jobs</h1>
        <p className="text-slate-500 mt-2">Search opportunities and check your eligibility before applying.</p>
      </div>

      <div className="bg-white border rounded-2xl p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search title or skill" className="border rounded-lg px-3 py-2" />
        <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Location" className="border rounded-lg px-3 py-2" />
        <input type="number" min="0" max="10" step="0.1" value={filters.minCGPA} onChange={(e) => setFilters({ ...filters, minCGPA: e.target.value })} placeholder="Your CGPA" className="border rounded-lg px-3 py-2" />
        <input value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} placeholder="Required skill" className="border rounded-lg px-3 py-2" /><button onClick={saveSearch} className="bg-slate-900 text-white rounded-lg px-4 py-2">Save Search</button>
      </div>

      {profile && !profile.resume?.url && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6">
          Upload your resume in Profile before applying for a job.
        </div>
      )}

      {!jobs.length ? (
        <EmptyState title="No jobs found" message="Try changing your search filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={applyForJob}
              applying={applyingId === job._id}
              applied={appliedIds.has(String(job._id))}
              eligible={job.eligibility?.eligible ?? (academicRecord?.cgpa === undefined || academicRecord?.cgpa >= job.minimumCGPA)}
              eligibilityReasons={job.eligibility?.reasons || []}
              onSave={saveJob}
              onFollowCompany={followCompany}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Jobs;
