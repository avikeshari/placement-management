import { ArrowRight, CheckCircle2, FileText, MessageCircle, ClipboardCheck, Video } from "lucide-react";
import { Link } from "react-router-dom";

const resources = [
  {
    to: "/student/resources/resume",
    title: "Resume preparation",
    description: "Build a concise, role-focused resume and keep achievements measurable.",
    icon: FileText,
    label: "Open resume guide",
  },
  {
    to: "/student/resources/interview",
    title: "Interview preparation",
    description: "Prepare company research, STAR examples, technical topics and questions.",
    icon: Video,
    label: "Open interview guide",
  },
  {
    to: "/student/resources/checklist",
    title: "Placement checklist",
    description: "See what is complete in your actual placement profile and what still needs attention.",
    icon: ClipboardCheck,
    label: "Open readiness checklist",
  },
  {
    to: "/student/resources/communication",
    title: "Professional communication",
    description: "Use concise, respectful messages and respond to recruiters promptly.",
    icon: MessageCircle,
    label: "Open communication guide",
  },
];

export default function CareerResources() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Student career center</p>
        <h1 className="text-3xl font-bold mt-1">Career Resources</h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Practical placement guidance, interview preparation, professional communication templates,
          and a readiness checklist connected to your placement data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {resources.map(({ to, title, description, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition" size={22} />
            </div>
            <h2 className="text-xl font-semibold mt-5">{title}</h2>
            <p className="text-slate-500 mt-2 leading-6">{description}</p>
            <div className="mt-5 text-sm font-semibold text-blue-600 flex items-center gap-2">
              {label} <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
        <CheckCircle2 className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <p className="text-sm text-slate-700">
          Start with the <Link className="font-semibold text-blue-700 hover:underline" to="/student/resources/checklist">Placement checklist</Link> to see which profile, academic, resume, application, and interview steps are already complete.
        </p>
      </div>
    </section>
  );
}
