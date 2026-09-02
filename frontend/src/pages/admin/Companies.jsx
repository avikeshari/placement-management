import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, UserX, UserCheck, Trash2, Upload, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import getErrorMessage from "../../utils/getErrorMessage";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 10;

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); const response = await api.get("/admin/companies"); setCompanies(response.data.companies || []); }
    catch (error) { setError(getErrorMessage(error, "Unable to load companies.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (company) => {
    try { const response = await api.patch(`/admin/users/${company._id}/status`, { isActive: !company.isActive }); setCompanies((items) => items.map((item) => item._id === company._id ? { ...item, isActive: response.data.user.isActive } : item)); toast.success(response.data.message); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to update account status.")); }
  };
  const remove = (company) => {
    setDeleteTarget(company);
  };
  const doRemove = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/admin/users/${deleteTarget._id}`); setCompanies((items) => items.filter((item) => item._id !== deleteTarget._id)); toast.success("Company deleted successfully"); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to delete company.")); }
    finally { setDeleteTarget(null); }
  };

  if (loading) return <Loader text="Loading companies..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const filtered = useMemo(() => companies.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase())), [companies, query]);
  useEffect(() => { setPage(1); }, [filtered]);
  const start = (page - 1) * pageSize;
  const visibleRows = filtered.slice(start, start + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return <section>
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">Companies</h1><p className="text-slate-500 mt-2">Monitor company accounts and hiring activity.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={async()=>{try{const r=await api.get("/admin/companies/export",{responseType:"blob"});const u=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=u;a.download="company-database.csv";a.click();URL.revokeObjectURL(u)}catch(e){toast.error(getErrorMessage(e,"Unable to export company database."))}}} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><Download size={16}/>Export Company Database</button><label className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"><Upload size={16}/>Import Company Database<input type="file" accept=".csv,text/csv" className="hidden" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;const form=new FormData();form.append("file",file);try{const r=await api.post("/admin/companies/import",form,{headers:{"Content-Type":"multipart/form-data"}});toast.success(r.data.message);load()}catch(err){toast.error(getErrorMessage(err,"Unable to import company database."))}finally{e.target.value=""}}}/></label></div></div><div className="relative w-full md:w-80"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies" className="w-full border rounded-lg pl-10 pr-3 py-2.5 bg-white" /></div></div>
    {!filtered.length ? <EmptyState title="No companies found" message="Try a different search." /> : <div className="bg-white border rounded-2xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{["Company","Jobs","Open Jobs","Status","Actions"].map((h) => <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{visibleRows.map((company) => <tr key={company._id} className="border-t"><td className="px-5 py-4"><p className="font-semibold">{company.name}</p><p className="text-slate-500">{company.email}</p></td><td className="px-5 py-4">{company.jobs}</td><td className="px-5 py-4">{company.openJobs}</td><td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs ${company.isActive === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{company.isActive === false ? "Inactive" : "Active"}</span></td><td className="px-5 py-4"><div className="flex gap-3"><button onClick={() => toggleStatus(company)} className="text-blue-600 inline-flex items-center gap-1">{company.isActive === false ? <UserCheck size={15} /> : <UserX size={15} />}{company.isActive === false ? "Activate" : "Deactivate"}</button><button onClick={() => remove(company)} className="text-red-600 inline-flex items-center gap-1"><Trash2 size={15} />Delete</button></div></td></tr>)}</tbody></table>{filtered.length > pageSize && <div className="flex items-center justify-between px-5 py-4 border-t"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg disabled:opacity-50">Previous</button><span className="text-slate-600">Page {page} of {totalPages}</span><button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg disabled:opacity-50">Next</button></div>}</div>}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete company account?"
        message={deleteTarget ? `Delete ${deleteTarget.name}'s company account? Its jobs, applications and interviews will also be removed.` : ""}
        confirmText="Delete Company"
        danger
        onConfirm={doRemove}
        onCancel={() => setDeleteTarget(null)}
      />
  </section>;
};
export default Companies;
