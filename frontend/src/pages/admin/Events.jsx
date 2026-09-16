import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", startAt: "", endAt: "", location: "", meetingUrl: "", capacity: 100 });

  const load = async () => {
    try {
      const r = await api.get("/career-events");
      setEvents(r.data.events || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load events");
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.startAt || !form.endAt) {
      toast.error("Please provide start and end times.");
      return;
    }
    if (new Date(form.endAt) <= new Date(form.startAt)) {
      toast.error("End time must be after the start time.");
      return;
    }
    const capacity = Number(form.capacity);
    if (!Number.isFinite(capacity) || capacity < 1) {
      toast.error("Capacity must be at least 1.");
      return;
    }
    if (form.meetingUrl.trim()) {
      try {
        const url = new URL(form.meetingUrl);
        if (!/^https?:$/.test(url.protocol)) throw new Error();
      } catch {
        toast.error("Meeting link must be a valid http(s) URL.");
        return;
      }
    }
    try {
      await api.post("/career-events", form);
      toast.success("Event created");
      setForm({ title: "", description: "", startAt: "", endAt: "", location: "", meetingUrl: "", capacity: 100 });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to create event");
    }
  };

  return <section>
    <h1 className="text-3xl font-bold mb-6">Career Events & Fairs</h1>
    <form onSubmit={create} className="bg-white border rounded-2xl p-6 grid md:grid-cols-2 gap-3 mb-6">
      <input required aria-label="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="border rounded-lg p-2" />
      <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location / venue" className="border rounded-lg p-2" />
      <textarea required aria-label="Event description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded-lg p-2 md:col-span-2" />
      <label className="md:col-span-2 text-sm text-slate-600">Start time<input required type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} className="border rounded-lg p-2 w-full mt-1" /></label>
      <label className="md:col-span-2 text-sm text-slate-600">End time<input required type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} className="border rounded-lg p-2 w-full mt-1" /></label>
      <input value={form.meetingUrl} onChange={e => setForm({ ...form, meetingUrl: e.target.value })} placeholder="Virtual meeting link (optional)" className="border rounded-lg p-2" />
      <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity (min 1)" className="border rounded-lg p-2" />
      <button className="bg-blue-600 text-white rounded-lg px-5 py-2 md:col-span-2">Publish Event</button>
    </form>
    <div className="space-y-3">
      {events.map((e) => <div className="bg-white border rounded-xl p-5" key={e._id}>
        <p className="font-semibold">{e.title}</p>
        <p className="text-slate-500">{e.startAt ? new Date(e.startAt).toLocaleString() : "—"} — {e.endAt ? new Date(e.endAt).toLocaleString() : "?"} ◦ {e.location || "Online"}</p>
        {e.meetingUrl && <a href={e.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">Open meeting link</a>}
        <p className="text-sm mt-2">{e.attendees?.length || 0} registered</p>
      </div>)}
    </div>
  </section>;
}