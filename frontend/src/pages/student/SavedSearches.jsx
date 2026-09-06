import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function SavedSearches() {
  const [rows, setRows] = useState([]);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const r = await api.get("/saved-searches");
      setRows(r.data.searches || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load saved searches");
    }
  };
  useEffect(() => { load(); }, []);
  const remove = async () => {
    if (!removing) return;
    try {
      setBusy(true);
      await api.delete(`/saved-searches/${removing._id}`);
      setRows((items) => items.filter((item) => item._id !== removing._id));
      toast.success("Search removed");
      setRemoving(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to remove search");
    } finally {
      setBusy(false);
    }
  };
  const detail = (query) => Object.entries(query || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ") || "All opportunities";
  return <section>
    <h1 className="text-3xl font-bold mb-6">Saved Searches & Job Alerts</h1>
    {!rows.length ? <EmptyState title="No saved searches" message="Save a search to get notified when matching jobs are posted." /> : (
      <div className="space-y-3">
        {rows.map((x) => <div className="bg-white border rounded-xl p-5 flex justify-between" key={x._id}>
          <div>
            <p className="font-semibold">{x.name}</p>
            <p className="text-sm text-slate-500">{detail(x.query)}</p>
            <p className="text-xs text-emerald-600 mt-2">{x.alertsEnabled ? "Job alerts enabled" : "Alerts disabled"}</p>
          </div>
          <button onClick={() => setRemoving(x)} className="text-red-600">Delete</button>
        </div>)}
      </div>
    )}
    <ConfirmDialog
      open={Boolean(removing)}
      title="Delete Saved Search"
      message={`Delete "${removing?.name || "this search"}"?`}
      confirmLabel="Delete"
      danger
      loading={busy}
      onConfirm={remove}
      onCancel={() => setRemoving(null)}
    />
  </section>;
}