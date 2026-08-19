import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import JobCard from "../../components/JobCard";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

import getErrorMessage from "../../utils/getErrorMessage";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] =
    useState([]);
  const [profile, setProfile] =
    useState(null);

  const [filters, setFilters] =
    useState({
      q: "",
      location: "",
      minCGPA: "",
      skill: ""
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [applyingId, setApplyingId] =
    useState(null);

  const fetchData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          Object.fromEntries(
            Object.entries(filters).filter(
              ([, value]) =>
                value !== ""
            )
          );

        /*
         * Jobs and applications are essential
         * for this page.
         */
        const [
          jobsResponse,
          applicationsResponse
        ] = await Promise.all([
          api.get(
            "/jobs/student",
            { params }
          ),
          api.get(
            "/applications/my"
          )
        ]);

        setJobs(
          jobsResponse.data.jobs || []
        );

        setApplications(
          applicationsResponse.data
            .applications || []
        );

        /*
         * Profile is useful for eligibility
         * and resume warnings, but it should
         * NEVER make the Jobs page unusable.
         */
        try {
          const profileResponse =
            await api.get(
              "/profile/me"
            );

          setProfile(
            profileResponse.data
              .profile || null
          );
        } catch (profileError) {
          console.error(
            "Profile loading failed:",
            profileError
          );

          /*
           * Keep the Jobs page working even
           * if profile retrieval temporarily
           * fails.
           */
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Jobs loading error:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load jobs."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const appliedIds =
    useMemo(
      () =>
        new Set(
          applications.map(
            (application) =>
              String(
                application.job?._id ||
                application.job
              )
          )
        ),
      [applications]
    );

  const applyForJob =
    async (jobId) => {
      /*
       * Do a client-side resume check first.
       * Backend also validates this.
       */
      if (!profile?.resume?.url) {
        toast.error(
          "Upload your resume before applying."
        );
        return;
      }

      try {
        setApplyingId(jobId);

        await api.post(
          `/applications/${jobId}`
        );

        toast.success(
          "Application submitted successfully"
        );

        setApplications(
          (previous) => [
            ...previous,
            {
              job: jobId,
              status: "applied"
            }
          ]
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Application failed"
          )
        );
      } finally {
        setApplyingId(null);
      }
    };

  if (loading) {
    return (
      <Loader text="Loading opportunities..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Find Jobs
        </h1>

        <p className="text-slate-500 mt-2">
          Search opportunities and check
          your eligibility before applying.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input
          value={filters.q}
          onChange={(event) =>
            setFilters({
              ...filters,
              q: event.target.value
            })
          }
          placeholder="Search title or skill"
          className="border rounded-lg px-3 py-2"
        />

        <input
          value={filters.location}
          onChange={(event) =>
            setFilters({
              ...filters,
              location:
                event.target.value
            })
          }
          placeholder="Location"
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={filters.minCGPA}
          onChange={(event) =>
            setFilters({
              ...filters,
              minCGPA:
                event.target.value
            })
          }
          placeholder="Your CGPA"
          className="border rounded-lg px-3 py-2"
        />

        <input
          value={filters.skill}
          onChange={(event) =>
            setFilters({
              ...filters,
              skill:
                event.target.value
            })
          }
          placeholder="Required skill"
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6">
          Your profile could not be loaded.
          You can still browse jobs, but
          complete your profile before
          applying.
        </div>
      )}

      {profile &&
        !profile.resume?.url && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6">
            Upload your resume in Profile
            before applying for a job.
          </div>
        )}

      {!jobs.length ? (
        <EmptyState
          title="No jobs found"
          message="Try changing your search filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const minimumCGPA =
              Number(job.minimumCGPA);

            const studentCGPA =
              Number(profile?.cgpa);

            const hasStudentCGPA =
              Number.isFinite(
                studentCGPA
              );

            const hasMinimumCGPA =
              Number.isFinite(
                minimumCGPA
              );

            const eligible =
              !hasMinimumCGPA ||
              !hasStudentCGPA ||
              studentCGPA >=
              minimumCGPA;

            return (
              <JobCard
                key={job._id}
                job={job}
                onApply={applyForJob}
                applying={
                  applyingId ===
                  job._id
                }
                applied={appliedIds.has(
                  String(job._id)
                )}
                eligible={eligible}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Jobs;