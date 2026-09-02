import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", startAt: "", endAt: "", location: "", companies: [] });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [driveResponse, companyResponse] = await Promise.all([api.get("/drives"), api.get("/admin/companies")]);
      setDrives(driveResponse.data.drives || []);
      setCompanies(companyResponse.data.companies || []);
    } catch (e) { toast.error(getErrorMessage(e, "Unable to load placement-drive data.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.startAt || !form.endAt) return toast.error("Drive name, start date and end date are required.");
    if (new Date(form.endAt)<=new Date(form.startAt)) return toast.error("End date/time must be later than the start date/time.");
    try { setSubmitting(true); await api.post("/drives", form); toast.success("Placement drive created"); setForm({ name: "", description: "", startAt: "", endAt: "", location: "", companies: [] }); load(); }
    catch (e) { toast.error(getErrorMessage(e, "Unable to create drive.")); }
    finally { setSubmitting(false); }
  };

  const toggleCompany = (id) => setForm(current => ({ ...current, companies: current.companies.includes(id) ? current.companies.filter(x => x !== id) : [...current.companies, id] }));

  const openReport = async (id) => {
    try { const response = await api.get(`/drives/${id}/report`); setReport(response.data.report); }
    catch (e) { toast.error(getErrorMessage(e, "Unable to load drive report.")); }
  };

  if (loading) return <Loader text="Loading placement drives..." />;

  return <section>
    <div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Placement Drives</h1><p className="text-slate-500 mt-2">Schedule drives, coordinate participating companies and track performance.</p></div>
    <form onSubmit={create} className="bg-white border rounded-2xl p-6 mt-6 grid md:grid-cols-2 gap-4">
      <label htmlFor="drive-name" className="block text-sm font-medium">Drive name<input id="drive-name" required placeholder="Drive name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>
      <label htmlFor="drive-location" className="block text-sm font-medium">Location / venue<input id="drive-location" placeholder="Location / venue" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Start<input required type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} className="block w-full border rounded-lg px-3 py-2.5 mt-1" /></label>
      <label className="text-sm font-medium">End<input required type="datetime-local" min={form.startAt || undefined} value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} className="block w-full border rounded-lg px-3 py-2.5 mt-1" /></label>
      <label htmlFor="drive-description" className="block text-sm font-medium md:col-span-2">Description<textarea id="drive-description" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2.5" /></label>
      <div className="md:col-span-2 border rounded-xl p-4">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold">Participating Companies</h2><p className="text-sm text-slate-500">Select companies invited to this drive.</p></div><span className="text-sm text-slate-500">{form.companies.length} selected</span></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">{companies.map(company => <label key={company._id} className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"><input type="checkbox" checked={form.companies.includes(company._id)} onChange={() => toggleCompany(company._id)} /><span>{company.name}</span></label>)}</div>
      </div>
      <button type="submit" disabled={submitting} className="md:col-span-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 disabled:bg-slate-400">{submitting ? "Creating..." : "Create Placement Drive"}</button>
    </form>

    <div className="space-y-4 mt-6">{drives.length ? drives.map(d => <article key={d._id} className="bg-white border rounded-2xl p-5">
      <div className="flex flex-col md:flex-row md:justify-between gap-3"><div><h2 className="font-semibold text-lg">{d.name}</h2><p className="text-slate-500">{new Date(d.startAt).toLocaleString("en-IN")} – {new Date(d.endAt).toLocaleString("en-IN")}</p></div><span className="capitalize bg-blue-50 text-blue-700 px-3 py-1 rounded-full h-fit">{d.status}</span></div>
      <p className="mt-3 text-slate-600">{d.description || "No description provided."}</p><p className="mt-3">Participants: <strong>{d.participants?.length || 0}</strong> · Companies: <strong>{d.companies?.length || 0}</strong></p>
      {d.companies?.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{d.companies.map(c => <span key={c._id} className="text-xs bg-slate-100 rounded-full px-2.5 py-1">{c.name}</span>)}</div>}
      <button onClick={() => openReport(d._id)} className="mt-4 border border-blue-200 text-blue-700 rounded-lg px-4 py-2">View Performance Report</button>
    </article>) : <EmptyState title="No placement drives yet" message="Create your first placement drive to get started." />}</div>

    {report && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setReport(null)}><div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center"><h2 className="text-xl font-bold">{report.drive.name} — Performance</h2><button onClick={() => setReport(null)} className="text-slate-500">Close</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{[["Participants", report.participants],["Companies", report.companies],["Applications", report.applications],["Interviews", report.interviews],["Offers Made", report.offersMade],["Offers Accepted", report.offersAccepted],["Placement Success", `${report.placementSuccessRate}%`]].map(([label,value]) => <div key={label} className="border rounded-xl p-4"><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}</div></div></div>}
  </section>;
}
