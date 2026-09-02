import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import getErrorMessage from '../../utils/getErrorMessage';

export default function SavedCandidates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/saved-candidates');
      setRows(data.candidates || []);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to load saved candidates'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!id || removingId === id) return;
    try {
      setRemovingId(id);
      await api.delete(`/saved-candidates/${id}`);
      toast.success('Candidate removed');
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to remove candidate'));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loader text="Loading saved candidates..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Saved Candidates</h1>
      {!rows.length ? (
        <EmptyState title="No saved candidates" message="Use Talent Search to save candidates for quick access." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((r) => (
            <article key={r._id} className="bg-white border rounded-2xl p-5">
              <h2 className="font-semibold">{r.student?.name}</h2>
              <p className="text-slate-500">{r.student?.email}</p>
              <button
                onClick={() => remove(r.student?._id)}
                disabled={removingId === r.student?._id}
                className="mt-4 text-red-600 disabled:text-slate-400"
              >
                {removingId === r.student?._id ? "Removing..." : "Remove"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
