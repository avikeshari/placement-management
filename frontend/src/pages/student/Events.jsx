import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import EventCard from "../../components/EventCard";
import ConfirmDialog from "../../components/ConfirmDialog";
import getErrorMessage from "../../utils/getErrorMessage";
import { useAuth } from "../../context/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmEvent, setConfirmEvent] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setEvents((await api.get("/career-events")).data.events || []);
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to load events"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uid = user?.id || user?._id;

  const isRegistered = (event) =>
    Array.isArray(event.attendees) &&
    event.attendees.some((a) => String(a && (a._id || a)) === String(uid));

  const addCalendar = (e) => {
    const dt = (x) => new Date(x).toISOString().replace(/[-:]/g, "").replace(/\.000Z$/, "Z");
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:${e._id}@placement-portal\r\nDTSTAMP:${dt(new Date())}\r\nDTSTART:${dt(e.startAt)}\r\nDTEND:${dt(e.endAt)}\r\nSUMMARY:${e.title.replace(/[\r\n]+/g, " ")}\r\nLOCATION:${(e.location || "Online").replace(/[\r\n]+/g, " ")}\r\nDESCRIPTION:${(e.description || "").replace(/[\r\n]+/g, " ")}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${e.title.replace(/[^a-z0-9]+/gi, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const register = async (id) => {
    if (registeringId === id) return;
    try {
      setRegisteringId(id);
      await api.post(`/career-events/${id}/register`);
      toast.success("Registered for event");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to register"));
    } finally {
      setRegisteringId(null);
    }
  };

  const unregister = async (id) => {
    const event = events.find((e) => e._id === id);
    const label = event?.title || "this event";
    setConfirmEvent({ id, label });
  };

  const doUnregister = async () => {
    if (!confirmEvent) return;
    try {
      await api.delete(`/career-events/${confirmEvent.id}/register`);
      toast.success("Registration cancelled");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to cancel registration"));
    } finally {
      setConfirmEvent(null);
    }
  };

  if (loading) return <Loader text="Loading events..." />;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Career Events & Fairs</h1>
      {!events.length ? (
        <EmptyState title="No upcoming events" message="Check back later for career events and fairs." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {events.map((e) => {
            const registered = isRegistered(e);
            const full = (e.attendees?.length || 0) >= (e.capacity || 0) && !registered;
            return (
              <div className="relative" key={e._id}>
                {registered && (
                  <span className="absolute top-4 right-4 z-10 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                    Registered
                  </span>
                )}
                <EventCard
                  event={e}
                  registered={registered}
                  full={full}
                  registering={registeringId === e._id}
                  onRegister={register}
                  onUnregister={unregister}
                  onAddCalendar={addCalendar}
                />
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmEvent}
        title="Cancel registration?"
        message={confirmEvent ? `Cancel your registration for "${confirmEvent.label}"?` : ""}
        confirmText="Cancel Registration"
        danger
        onConfirm={doUnregister}
        onCancel={() => setConfirmEvent(null)}
      />
    </section>
  );
}
