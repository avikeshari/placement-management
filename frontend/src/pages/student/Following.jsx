import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

export default function Following() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { setLoading(true); setCompanies((await api.get("/company-follows")).data.follows || []); } catch (e) { toast.error(e.response?.data?.message || "Unable to load followed companies."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const unfollow = async (id) => { try { await api.delete(`/company-follows/${id}`); toast.success("Company unfollowed"); load(); } catch (e) { toast.error(e.response?.data?.message || "Unable to unfollow company."); } };
  if (loading) return <Loader text="Loading followed companies..." />;
  return <section><h1 className="text-3xl font-bold">Following</h1><p className="text-slate-500 mt-2">Companies you follow for future opportunities.</p><div className="grid md:grid-cols-2 gap-4 mt-6">{!companies.length ? <p className="text-slate-500">You are not following any companies yet.</p> : companies.map(item => <article key={item._id} className="bg-white border rounded-2xl p-5"><h2 className="font-semibold">{item.company?.name || item.name || "Company"}</h2><p className="text-slate-500 mt-1">{item.company?.email || item.email || ""}</p><button onClick={() => unfollow(item.company?._id || item.companyId || item._id)} className="mt-4 text-red-600">Unfollow</button></article>)}</div></section>;
}
