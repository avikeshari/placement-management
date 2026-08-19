import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Trash2, Save } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import getErrorMessage from "../../utils/getErrorMessage";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get("/profile/me"); setProfile(data.profile); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to load company profile.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const change = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    try { setSaving(true); const { data } = await api.put("/profile/me", profile); setProfile(data.profile); toast.success("Company profile updated"); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to update profile.")); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!window.confirm("Delete the company account? All jobs, applications and interviews will be permanently removed.")) return;
    try { setDeleting(true); await api.delete("/profile/me"); localStorage.clear(); window.location.href = "/login"; }
    catch (error) { toast.error(getErrorMessage(error, "Unable to delete company account.")); setDeleting(false); }
  };

  if (loading) return <Loader text="Loading profile..." />;
  return <section className="space-y-6 max-w-4xl"><div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-700 p-3 rounded-xl"><Building2 /></div><div><h1 className="text-2xl md:text-3xl font-bold">Company Profile</h1><p className="text-slate-500">Manage your company information.</p></div></div>
    <form onSubmit={save} className="bg-white border rounded-2xl p-6 space-y-5"><div className="grid md:grid-cols-2 gap-5">
      {["phone","location","industry","website"].map((name) => <div key={name}><label className="block text-sm font-medium mb-2 capitalize">{name}</label><input name={name} value={profile?.[name] || ""} onChange={change} className="w-full border rounded-lg px-3 py-2.5" /></div>)}
    </div><div><label className="block text-sm font-medium mb-2">Company Description</label><textarea name="description" rows="5" value={profile?.description || ""} onChange={change} className="w-full border rounded-lg px-3 py-2.5" /></div><button disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400"><Save size={17}/>{saving ? "Saving..." : "Save Profile"}</button></form>
    <section className="bg-red-50 border border-red-200 rounded-2xl p-6"><h2 className="font-bold text-red-700">Danger Zone</h2><p className="text-sm text-slate-600 mt-2">Deleting your company permanently removes your jobs and associated recruitment records.</p><button onClick={remove} disabled={deleting} className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400"><Trash2 size={17}/>{deleting ? "Deleting..." : "Delete Company Account"}</button></section>
  </section>;
};
export default Profile;
