import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/getErrorMessage';

export default function Verification() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setRows((await api.get('/admin/companies')).data.companies || []);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to load companies'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    if (togglingId === c._id) return;
    try {
      setTogglingId(c._id);
      await api.patch(`/admin/companies/${c._id}/verification`, { verified: !c.isVerified });
      toast.success('Verification updated');
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to update verification'));
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <Loader text="Loading companies..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Employer Verification</h1>
      <div className="space-y-3">
        {!rows.length ? (
          <EmptyState title="No companies to verify" message="Companies registered on the platform will appear here." />
        ) : rows.map((c) => (
          <div className="bg-white border rounded-xl p-4 flex justify-between items-center" key={c._id}>
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-slate-500">{c.email}</p>
            </div>
            <button
              onClick={() => toggle(c)}
              disabled={togglingId === c._id}
              className={c.isVerified ? 'text-red-600 disabled:text-slate-400' : 'text-green-600 disabled:text-slate-400'}
            >
              {togglingId === c._id ? "Updating..." : c.isVerified ? 'Remove Verification' : 'Verify Company'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
