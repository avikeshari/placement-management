import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/getErrorMessage';

export default function SavedSearches() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('/saved-searches');
      setRows(r.data.searches || []);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to load saved searches'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (removingId === id) return;
    try {
      setRemovingId(id);
      await api.delete(`/saved-searches/${id}`);
      toast.success('Search removed');
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to remove search'));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loader text="Loading saved searches..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Saved Searches & Job Alerts</h1>
      {!rows.length ? (
        <EmptyState
          title="No saved searches"
          message="Save a search while browsing jobs to receive alerts for new matching opportunities."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((x) => {
            const query = x.query || {};
            const params = new URLSearchParams();
            Object.entries(query).filter(([, v]) => v).forEach(([k, v]) => params.set(k, String(v)));
            const runUrl = `/student/jobs${params.toString() ? `?${params.toString()}` : ''}`;
            return (
              <div className="bg-white border rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3" key={x._id}>
                <div>
                  <p className="font-semibold">{x.name}</p>
                  <p className="text-sm text-slate-500">{Object.entries(query).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'All opportunities'}</p>
                  <p className="text-xs text-emerald-600 mt-2">{x.alertsEnabled ? 'Job alerts enabled' : 'Alerts disabled'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(runUrl)} className="text-blue-600 text-sm font-medium">Apply Search</button>
                  <button onClick={() => remove(x._id)} disabled={removingId === x._id} className="text-red-600 text-sm disabled:text-slate-400">{removingId === x._id ? "Removing..." : "Delete"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
