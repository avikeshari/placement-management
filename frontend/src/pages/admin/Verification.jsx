import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function Verification() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setRows((await api.get("/admin/companies")).data.companies || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load companies");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const toggle = async () => {
    if (!target) return;
    try {
      setSaving(true);
      await api.patch(`/admin/companies/${target._id}/verification`, { verified: !target.isVerified });
      toast.success("Verification updated");
      setTarget(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update verification");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading companies..." />;
  return <section>
    <h1 className="text-3xl font-bold mb-6">Employer Verification</h1>
    <div className="space-y-3">
      {rows.map((c) => <div className="bg-white border rounded-xl p-4 flex justify-between" key={c._id}>
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-slate-500">{c.email}</p>
        </div>
        <button onClick={() => setTarget(c)} className={c.isVerified ? "text-red-600" : "text-green-600"}>
          {c.isVerified ? "Remove Verification" : "Verify Company"}
        </button>
      </div>)}
    </div>
    <ConfirmDialog
      open={Boolean(target)}
      title={target?.isVerified ? "Remove Verification" : "Verify Company"}
      message={target ? `${target.isVerified ? "Revoke verification for" : "Verify"}'${target.name}'?` : ""}
      confirmLabel={target?.isVerified ? "Remove Verification" : "Verify Company"}
      danger={Boolean(target?.isVerified)}
      loading={saving}
      onConfirm={toggle}
      onCancel={() => setTarget(null)}
    />
  </section>;
}