import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import toast from "react-hot-toast";
import getErrorMessage from "../../utils/getErrorMessage";

export default function SavedJobs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setRows((await api.get("/saved-jobs")).data.savedJobs || []);
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to load saved jobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!id || removingId === id) return;
    try {
      setRemovingId(id);
      await api.delete(`/saved-jobs/${id}`);
      toast.success("Job removed from saved jobs");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to remove saved job"));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loader text="Loading saved jobs..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      {!rows.length ? (
        <EmptyState title="No saved jobs yet" message="Jobs you save will appear here for easy access." />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div className="bg-white border rounded-2xl p-5 flex justify-between gap-4" key={r._id}>
              <div>
                <h2 className="font-semibold">{r.job?.title}</h2>
                <p className="text-slate-500">{r.job?.company?.name} · {r.job?.location || "Location flexible"}</p>
              </div>
              <button
                onClick={() => remove(r.job?._id)}
                disabled={removingId === r.job?._id}
                className="text-red-600 disabled:text-slate-400"
              >
                {removingId === r.job?._id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
