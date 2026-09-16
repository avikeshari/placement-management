import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setEvents((await api.get("/career-events")).data.events || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load events");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const addCalendar = (e) => {
    const dt = (x) => new Date(x).toISOString().replace(/[-:]/g, "").replace(/\.000Z$/, "Z");
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:${e._id}@placement-portal\r\nDTSTAMP:${dt(new Date())}\r\nDTSTART:${dt(e.startAt)}\r\nDTEND:${dt(e.endAt)}\r\nSUMMARY:${e.title}\r\nLOCATION:${e.location || "Online"}\r\nDESCRIPTION:${e.description || ""}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${e.title.replace(/[^a-z0-9]+/gi, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const toggleRegistration = async () => {
    if (!confirmTarget) return;
    try {
      setBusy(true);
      const target = confirmTarget;
      setConfirmTarget(null);
      if (target.isRegistered) {
        await api.delete(`/career-events/${target._id}/register`);
        toast.success("Cancelled event registration");
      } else {
        await api.post(`/career-events/${target._id}/register`);
        toast.success("Registered for event");
      }
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update registration");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader text="Loading events..." />;
  return <section>
    <h1 className="text-3xl font-bold mb-6">Career Events & Fairs</h1>
    {!events.length ? <EmptyState title="No upcoming events" message="Events will appear here once scheduled by the placement office." /> : (
      <div className="grid md:grid-cols-2 gap-5">
        {events.map((e) => <article className="bg-white border rounded-2xl p-6" key={e._id}>
          <h2 className="text-xl font-semibold">{e.title}</h2>
          <p className="text-slate-500 mt-2">{e.description}</p>
          <p className="mt-3">{new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleString()}</p>
          <p className="text-sm text-slate-500">{e.location || "Online"} · {e.attendees?.length || 0}/{e.capacity} registered</p>
          {e.meetingUrl && <a href={e.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline inline-block mt-2">Open meeting link</a>}
          {e.isRegistered && <p className="mt-3 inline-block bg-green-100 text-green-700 text-sm px-2.5 py-1 rounded-full">Registered</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setConfirmTarget(e)}
              disabled={busy || (e.attendees?.length >= e.capacity && !e.isRegistered)}
              className={e.isRegistered ? "bg-red-600 text-white rounded-lg px-4 py-2 disabled:opacity-60" : "bg-blue-600 text-white rounded-lg px-4 py-2 disabled:bg-slate-400"}
            >
              {e.isRegistered ? "Cancel Registration" : "Register"}
            </button>
            <button onClick={() => addCalendar(e)} className="border rounded-lg px-4 py-2">Add to Calendar</button>
          </div>
        </article>)}
      </div>
    )}
    <ConfirmDialog
      open={Boolean(confirmTarget)}
      title={confirmTarget?.isRegistered ? "Cancel Registration" : "Register for Event"}
      message={confirmTarget ? `${confirmTarget.isRegistered ? "Cancel your registration for" : "Register for'"}${confirmTarget.title}'?` : ""}
      confirmLabel={confirmTarget?.isRegistered ? "Cancel Registration" : "Register"}
      danger={Boolean(confirmTarget?.isRegistered)}
      loading={busy}
      onConfirm={toggleRegistration}
      onCancel={() => setConfirmTarget(null)}
    />
  </section>;
}