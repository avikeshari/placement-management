import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setItems((await api.get("/notifications")).data.notifications || []);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const read = async (id) => {
    if (readingId) return;
    try {
      setReadingId(id);
      await api.patch(`/notifications/${id}/read`);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to mark notification as read"));
    } finally {
      setReadingId(null);
    }
  };

  if (loading) return <Loader text="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {!items.length ? (
        <EmptyState
          title="No notifications yet"
          message="Updates about your applications, interviews and placement activity will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <button
              onClick={() => read(n._id)}
              disabled={readingId === n._id}
              key={n._id}
              className={`w-full text-left bg-white border rounded-xl p-4 disabled:opacity-60 ${!n.readAt ? "border-blue-300" : ""}`}
            >
              <p className="font-semibold">{n.title}</p>
              <p className="text-slate-600 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
