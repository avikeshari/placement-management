import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/getErrorMessage';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', location: '', meetingUrl: '', capacity: 100 });

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.get('/career-events');
      setEvents(r.data.events || []);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to load events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.title.trim() || !form.startAt || !form.endAt) {
      toast.error('Event title, start time and end time are required.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/career-events', form);
      toast.success('Event created');
      setForm({ title: '', description: '', startAt: '', endAt: '', location: '', meetingUrl: '', capacity: 100 });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create event'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading events..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Career Events & Fairs</h1>
      <form onSubmit={create} className="bg-white border rounded-2xl p-6 grid md:grid-cols-2 gap-3 mb-6">
        <label htmlFor="event-title" className="block text-sm font-medium">Event title
          <input id="event-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-location" className="block text-sm font-medium">Location / venue
          <input id="event-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location / venue" className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-description" className="block text-sm font-medium md:col-span-2">Description
          <textarea id="event-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-start" className="block text-sm font-medium">Start
          <input id="event-start" required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-end" className="block text-sm font-medium">End
          <input id="event-end" required type="datetime-local" min={form.startAt || undefined} value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-url" className="block text-sm font-medium">Virtual meeting link (optional)
          <input id="event-url" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="Virtual meeting link (optional)" className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label htmlFor="event-capacity" className="block text-sm font-medium">Capacity
          <input id="event-capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" className="mt-1 w-full border rounded-lg p-2" />
        </label>
        <button type="submit" disabled={submitting} className="bg-blue-600 text-white rounded-lg px-5 py-2 md:col-span-2 disabled:bg-slate-400">
          {submitting ? "Publishing..." : "Publish Event"}
        </button>
      </form>
      <div className="space-y-3">
        {!events.length ? (
          <EmptyState title="No events yet" message="Create a career event or fair to get started." />
        ) : events.map((e) => (
          <div className="bg-white border rounded-xl p-5" key={e._id}>
            <p className="font-semibold">{e.title}</p>
            <p className="text-slate-500">{new Date(e.startAt).toLocaleString()} · {e.location || 'Online'}</p>
            <p className="text-sm mt-2">{e.attendees?.length || 0} registered</p>
          </div>
        ))}
      </div>
    </section>
  );
}
