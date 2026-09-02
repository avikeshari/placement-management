import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function Drives() {
  const { user } = useAuth();
  const [d, setD] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/drives");
      setD(r.data.drives || []);
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to load placement drives"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uid = user?.id || user?._id;

  const isJoined = (drive) =>
    Array.isArray(drive.participants) &&
    drive.participants.some(
      (p) => String(p && (p._id || p)) === String(uid)
    );

  const join = async (drive) => {
    if (joiningId === drive._id) return;
    try {
      setJoiningId(drive._id);
      await api.post(`/drives/${drive._id}/join`);
      toast.success("You joined the placement drive");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to join drive"));
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return <Loader text="Loading placement drives..." />;

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold">Placement Drives</h1>
      <p className="text-slate-500 mt-2">Join placement drives and track participation.</p>
      {!d.length ? (
        <div className="mt-6">
          <EmptyState title="No placement drives" message="Check back later for upcoming placement drives." />
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {d.map((x) => {
            const joined = isJoined(x);
            return (
              <article key={x._id} className="bg-white border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-semibold text-lg">{x.name}</h2>
                  {joined && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                      Joined
                    </span>
                  )}
                </div>
                <p className="text-slate-500 mt-1">
                  {new Date(x.startAt).toLocaleString("en-IN")} – {new Date(x.endAt).toLocaleString("en-IN")}
                </p>
                <p className="mt-3">{x.description}</p>
                <button
                  onClick={() => join(x)}
                  disabled={joined || joiningId === x._id}
                  className={`mt-4 px-4 py-2 rounded-lg font-medium ${joined ? "bg-slate-200 text-slate-500 cursor-not-allowed" : joiningId === x._id ? "bg-blue-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {joined ? "Already Joined" : joiningId === x._id ? "Joining..." : "Join Drive"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
