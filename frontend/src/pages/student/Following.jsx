import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";

export default function Following() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowTarget, setUnfollowTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setLoading(true);
      setCompanies((await api.get("/company-follows")).data.follows || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load followed companies.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const unfollow = async () => {
    if (!unfollowTarget) return;
    try {
      setBusy(true);
      await api.delete(`/company-follows/${unfollowTarget}`);
      setCompanies((items) => items.filter((item) => (item.company?._id || item.companyId || item._id) !== unfollowTarget));
      toast.success("Company unfollowed");
      setUnfollowTarget(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to unfollow company.");
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Loader text="Loading followed companies..." />;
  const targetName = companies.find((item) => (item.company?._id || item.companyId || item._id) === unfollowTarget)?.company?.name || (companies.find((item) => (item.company?._id || item.companyId || item._id) === unfollowTarget)?.name);
  return <section>
    <h1 className="text-3xl font-bold">Following</h1>
    <p className="text-slate-500 mt-2">Companies you follow for future opportunities.</p>
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      {!companies.length ? <div className="md:col-span-2"><EmptyState title="Not following any companies" message="Follow companies to stay updated on their latest openings." /></div> : companies.map((item) => {
        const id = item.company?._id || item.companyId || item._id;
        return <article key={item._id} className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold">{item.company?.name || item.name || "Company"}</h2>
          <p className="text-slate-500 mt-1">{item.company?.email || item.email || ""}</p>
          <button onClick={() => setUnfollowTarget(id)} className="mt-4 text-red-600">Unfollow</button>
        </article>;
      })}
    </div>
    <ConfirmDialog
      open={Boolean(unfollowTarget)}
      title="Unfollow Company"
      message={`Stop following ${targetName || "this company"}?`}
      confirmLabel="Unfollow"
      danger
      loading={busy}
      onConfirm={unfollow}
      onCancel={() => setUnfollowTarget(null)}
    />
  </section>;
}