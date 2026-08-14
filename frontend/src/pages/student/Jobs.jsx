import {
  useCallback,
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Trash2
} from "lucide-react";

import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Jobs = () => {
  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const load =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/jobs/company/my"
          );

        setJobs(
          response.data.jobs || []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to load your jobs."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (
    jobId,
    title
  ) => {
    const confirmed =
      window.confirm(
        `Delete the job "${title}"? Existing applications and interviews for this job will also be removed. This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(jobId);

      await api.delete(
        `/jobs/${jobId}`
      );

      setJobs((previous) =>
        previous.filter(
          (job) =>
            job._id !== jobId
        )
      );

      toast.success(
        "Job deleted successfully"
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to delete job."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Loader text="Loading jobs..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            My Jobs
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your placement opportunities.
          </p>
        </div>

        <Link
          to="/company/jobs/new"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
        >
          Post Job
        </Link>
      </div>

      {!jobs.length ? (
        <EmptyState
          title="No jobs posted"
          message="Create your first placement opportunity."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="bg-white border rounded-xl p-5 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {job.title}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    {job.location ||
                      "Location not specified"}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm mt-3">
                    <span>
                      Salary:{" "}
                      {job.salary ??
                        "Not specified"}
                    </span>

                    <span>
                      Minimum CGPA:{" "}
                      {job.minimumCGPA ??
                        "Not specified"}
                    </span>

                    <span>
                      Status:{" "}
                      <span className="capitalize font-medium">
                        {job.status}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/company/jobs/${job._id}/applications`}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    View Applicants
                  </Link>

                  <Link
                    to={`/company/jobs/${job._id}/edit`}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        job._id,
                        job.title
                      )
                    }
                    disabled={
                      deletingId ===
                      job._id
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <Trash2
                      size={16}
                    />

                    {deletingId ===
                      job._id
                      ? "Deleting..."
                      : "Delete Job"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Jobs;