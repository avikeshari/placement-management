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
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/applications/job/${jobId}`
      );

      setApplications(
        response.data.applications || []
      );
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

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      setUpdating(applicationId);

      await api.patch(
        `/applications/${applicationId}/status`,
        { status }
      );

      toast.success(
        "Application status updated"
      );

      load();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to update status"
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <Loader text="Loading applicants..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
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
            className="bg-white border rounded-xl p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
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

                {application.resume?.url && (
                  <a
                    href={application.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-blue-600"
                  >
                    View submitted resume
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {application.status === "applied" && (
                  <>
                    <button
                      disabled={updating === application._id}
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
                      disabled={updating === application._id}
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

                {application.status === "shortlisted" && (
                  <button
                    disabled={updating === application._id}
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
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applicants;
