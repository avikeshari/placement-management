import { CalendarDays } from "lucide-react";

const EventCard = ({ event, onRegister, onUnregister, onAddCalendar, registered = false, full = false, registering = false }) => (
  <article className="bg-white border rounded-2xl p-5">
    <div className="flex gap-3 items-start">
      <CalendarDays className="text-blue-600 shrink-0 mt-0.5" />
      <div>
        <h2 className="font-semibold">{event.title}</h2>
        <p className="text-sm text-slate-500">
          {new Date(event.startAt).toLocaleString()} · {event.location || "Online"}
        </p>
      </div>
    </div>
    <p className="text-slate-600 mt-3">{event.description}</p>
    <div className="mt-4 flex gap-2">
      {registered ? (
        <button
          onClick={() => onUnregister?.(event._id)}
          className="border rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel Registration
        </button>
      ) : (
        <button
          onClick={() => onRegister?.(event._id)}
          disabled={full || registering}
          className={`rounded-lg px-4 py-2 ${full ? "bg-slate-200 text-slate-500 cursor-not-allowed" : registering ? "bg-blue-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {full ? "Event Full" : registering ? "Registering..." : "Register"}
        </button>
      )}
      {onAddCalendar && (
        <button onClick={() => onAddCalendar(event)} className="border rounded-lg px-4 py-2">
          Add to Calendar
        </button>
      )}
    </div>
  </article>
);

export default EventCard;
