import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import JobCard from "../../components/JobCard";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";
import usePageTitle from "../../hooks/usePageTitle";

const Jobs = () => {
  usePageTitle("Find Jobs");
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [academicRecord, setAcademicRecord] = useState(null);
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    minCGPA: searchParams.get("minCGPA") || "",
    skill: searchParams.get("skill") || ""
  }));
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = { ...Object.fromEntries(Object.entries(debouncedFilters).filter(([, v]) => v !== "")), page, limit: 12 };
      const [jobsResponse, applicationsResponse, profileResponse, academicResponse] = await Promise.allSettled([
        api.get("/jobs/student", { params }),
        api.get("/applications/my"),
        api.get("/profile/me"),
        api.get("/academic/me")
      ]);
      setJobs(jobsResponse.status === "fulfilled" ? jobsResponse.value.data.jobs || [] : []);
      setPagination(jobsResponse.status === "fulfilled" ? jobsResponse.value.data.pagination || { page: 1, pages: 1, total: 0 } : { page: 1, pages: 1, total: 0 });
      setApplications(applicationsResponse.status === "fulfilled" ? applicationsResponse.value.data.applications || [] : []);
      setProfile(profileResponse.status === "fulfilled" ? profileResponse.value.data.profile || null : null);
      setAcademicRecord(academicResponse.status === "fulfilled" ? academicResponse.value.data.record || null : null);
      if (jobsResponse.status === "rejected") {
        setError(getErrorMessage(jobsResponse.reason, "Unable to load jobs."));
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(1); }, [filters]);

  const appliedIds = useMemo(() => new Set(applications.map((a) => String(a.job?._id || a.job))), [applications]);

  const [searchModal, setSearchModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [applyModal, setApplyModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const saveJob = async (jobId) => { try { await api.post(`/saved-jobs/${jobId}`); toast.success("Job saved"); } catch (e) { toast.error(getErrorMessage(e,"Unable to save job")); } };
  const followCompany = async (companyId) => { if (!companyId) return; try { await api.post(`/company-follows/${companyId}`); toast.success("Company followed"); } catch (e) { toast.error(getErrorMessage(e,"Unable to follow company")); } };
  const saveSearch = async () => {
    const name = searchName.trim() || filters.q || filters.skill || "My job search";
    if (!name) { toast.error("Please enter a name for this search"); return; }
    try { await api.post("/saved-searches", { name, query: filters, alertsEnabled: true }); toast.success("Search saved and alerts enabled"); setSearchModal(false); setSearchName(""); }
    catch (e) { toast.error(getErrorMessage(e,"Unable to save search")); }
  };

  const applyForJob = async (targetJob) => {
    const body = (coverLetter || "").trim();
    if (body.length > 5000) { toast.error("Cover letter must be 5000 characters or fewer"); return; }
    try {
      setApplyingId(targetJob._id);
      await api.post(`/applications/${targetJob._id}`, { coverLetter: body });
      toast.success("Application submitted successfully");
      setApplications((prev) => [...prev, { job: targetJob._id, status: "applied" }]);
      setApplyModal(null);
      setCoverLetter("");
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
        <input value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} placeholder="Required skill" className="border rounded-lg px-3 py-2" /><button onClick={() => setSearchModal(true)} className="bg-slate-900 text-white rounded-lg px-4 py-2">Save Search</button>
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
              onApply={() => { setApplyModal(job); setCoverLetter(""); }}
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

      {searchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSearchModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-semibold">Save Search</h3>
            <p className="text-sm text-slate-500 mt-1">Name this search to receive job alerts.</p>
            <label htmlFor="search-name" className="block text-sm font-medium text-slate-700 mt-4">Search name</label>
            <input
              id="search-name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder={filters.q || filters.skill || "My job search"}
              className="w-full border rounded-lg px-3 py-2 mt-2"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setSearchModal(false)} className="border px-4 py-2 rounded-lg">Cancel</button>
              <button type="button" onClick={saveSearch} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Search</button>
            </div>
          </div>
        </div>
      )}

      {applyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setApplyModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-semibold">Apply to {applyModal.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{applyModal.company?.name || "Company"}</p>
            <label htmlFor="cover-letter" className="block text-sm font-medium text-slate-700 mt-4">Cover letter (optional)</label>
            <textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              maxLength={5000}
              placeholder="Write a short note to the recruiter..."
              className="w-full border rounded-lg px-3 py-2 mt-2"
            />
            <p className="text-xs text-slate-400 mt-1">{coverLetter.length}/5000 characters</p>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setApplyModal(null)} className="border px-4 py-2 rounded-lg">Cancel</button>
              <button type="button" onClick={() => applyForJob(applyModal)} disabled={applyingId === applyModal._id} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-slate-400">{applyingId === applyModal._id ? "Submitting..." : "Submit Application"}</button>
            </div>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Jobs;
