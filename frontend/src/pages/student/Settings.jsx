import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import getErrorMessage from '../../utils/getErrorMessage';

export default function Settings() {
  const [form, setForm] = useState({
    privacy: 'private',
    shareGpaWithEmployers: false,
    jobInterests: '',
    preferredLocations: '',
    preferredJobTypes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profile/me')
      .then((r) => {
        const p = r.data.profile || {};
        setForm({
          privacy: p.privacy || 'private',
          shareGpaWithEmployers: !!p.shareGpaWithEmployers,
          jobInterests: (p.jobInterests || []).join(', '),
          preferredLocations: (p.preferredLocations || []).join(', '),
          preferredJobTypes: (p.preferredJobTypes || []).join(', ')
        });
      })
      .catch((e) => toast.error(getErrorMessage(e, 'Unable to load your preferences')))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      await api.put('/profile/me', {
        ...form,
        jobInterests: form.jobInterests.split(',').map((x) => x.trim()).filter(Boolean),
        preferredLocations: form.preferredLocations.split(',').map((x) => x.trim()).filter(Boolean),
        preferredJobTypes: form.preferredJobTypes.split(',').map((x) => x.trim()).filter(Boolean)
      });
      toast.success('Privacy and career preferences saved');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to save settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading preferences..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Privacy & Career Preferences</h1>
      <form onSubmit={save} className="bg-white border rounded-2xl p-6 max-w-2xl space-y-5">
        <div>
          <label htmlFor="privacy" className="block font-medium mb-2">Profile visibility</label>
          <select id="privacy" value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })} className="border rounded-lg px-3 py-2 w-full">
            <option value="private">Private</option>
            <option value="employers">Employers</option>
            <option value="community">Community</option>
          </select>
          <p className="text-sm text-slate-500 mt-2">Private hides your profile from employer discovery; Employers makes it discoverable to approved employers.</p>
        </div>
        <label className="flex gap-2 items-center">
          <input type="checkbox" checked={form.shareGpaWithEmployers} onChange={(e) => setForm({ ...form, shareGpaWithEmployers: e.target.checked })} />
          Share GPA with employers
        </label>
        <div>
          <label htmlFor="jobInterests" className="block font-medium mb-2">Job interests</label>
          <input id="jobInterests" value={form.jobInterests} onChange={(e) => setForm({ ...form, jobInterests: e.target.value })} placeholder="e.g. Frontend, Data Science" className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div>
          <label htmlFor="preferredLocations" className="block font-medium mb-2">Preferred locations</label>
          <input id="preferredLocations" value={form.preferredLocations} onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })} placeholder="e.g. Bengaluru, Remote" className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div>
          <label htmlFor="preferredJobTypes" className="block font-medium mb-2">Preferred opportunity types</label>
          <input id="preferredJobTypes" value={form.preferredJobTypes} onChange={(e) => setForm({ ...form, preferredJobTypes: e.target.value })} placeholder="e.g. job, internship" className="border rounded-lg px-3 py-2 w-full" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400">
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </section>
  );
}
