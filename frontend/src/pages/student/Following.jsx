import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import toast from "react-hot-toast";
import getErrorMessage from "../../utils/getErrorMessage";

export default function Following() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setCompanies((await api.get("/company-follows")).data.follows || []);
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to load followed companies."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unfollow = async (id) => {
    if (!id || unfollowingId === id) return;
    try {
      setUnfollowingId(id);
      await api.delete(`/company-follows/${id}`);
      toast.success("Company unfollowed");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to unfollow company."));
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) return <Loader text="Loading followed companies..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold">Following</h1>
      <p className="text-slate-500 mt-2">Companies you follow for future opportunities.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {!companies.length ? (
          <div className="md:col-span-2">
            <EmptyState title="Not following any companies" message="Follow companies to see their future placement opportunities." />
          </div>
        ) : companies.map((item) => (
          <article key={item._id} className="bg-white border rounded-2xl p-5">
            <h2 className="font-semibold">{item.company?.name || item.name || "Company"}</h2>
            <p className="text-slate-500 mt-1">{item.company?.email || item.email || ""}</p>
            <button
              onClick={() => unfollow(item.company?._id || item.companyId || item._id)}
              disabled={unfollowingId === (item.company?._id || item.companyId || item._id)}
              className="mt-4 text-red-600 disabled:text-slate-400"
            >
              {unfollowingId === (item.company?._id || item.companyId || item._id) ? "Unfollowing..." : "Unfollow"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
