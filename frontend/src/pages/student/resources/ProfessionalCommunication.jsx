import { ArrowLeft, MessageCircle, Copy, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import ResourceSources from "./ResourceSources";

const habits = [
  "Use a professional email address and a clear subject or opening line.",
  "Keep the message concise and identify the job, interview or request clearly.",
  "Use a respectful greeting and a professional tone rather than informal shorthand.",
  "Proofread names, dates, attachments and links before sending.",
  "Reply promptly when a recruiter asks for information or a scheduling response.",
  "After an interview, send a brief thank-you message that refers to the conversation.",
];

const templates = [
  { title: "Interview confirmation", text: "Hello [Recruiter Name],\n\nThank you for scheduling the interview for the [Role] position. I confirm my availability for [Date/Time]. I look forward to speaking with you.\n\nBest regards,\n[Your Name]" },
  { title: "Interview follow-up", text: "Hello [Recruiter Name],\n\nThank you for the opportunity to interview for the [Role] position. I appreciated learning more about the role and team. Please let me know if you need any additional information from me.\n\nBest regards,\n[Your Name]" },
  { title: "Recruiter introduction", text: "Hello [Recruiter Name],\n\nI am interested in the [Role] opportunity at [Company]. My background in [Skill/Area] aligns with the role, and I would be glad to provide any additional information required.\n\nBest regards,\n[Your Name]" },
  { title: "Professional decline", text: "Hello [Recruiter Name],\n\nThank you for the opportunity. After consideration, I would like to decline at this time. I appreciate your time and hope we can connect again in the future.\n\nBest regards,\n[Your Name]" },
];

const sources = [
  { label: "UC Davis Career Center — Professional Communication", url: "https://careercenter.ucdavis.edu/resumes-and-materials/professional-communication" },
  { label: "Harvard Career Services — Professionalism", url: "https://careerservices.fas.harvard.edu/professionalism/" },
  { label: "Harvard Career Services — Networking Email Examples", url: "https://careerservices.fas.harvard.edu/resources/harvard-griffin-gsas-guide-to-building-professional-connections/" },
];

export default function ProfessionalCommunication() {
  const [copied, setCopied] = useState("");
  const copy = async (text, title) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(title);
      toast.success("Template copied");
      setTimeout(() => setCopied(""), 1500);
    } catch {
      toast.error("Unable to copy template");
    }
  };

  return (
    <article className="max-w-5xl">
      <Link to="/student/resources" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline mb-6"><ArrowLeft size={16} /> Back to Career Resources</Link>
      <header className="bg-white border rounded-2xl p-7 mb-6">
        <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MessageCircle size={24} /></div><div><p className="text-sm font-semibold text-blue-600">Career guide · 4 min read</p><h1 className="text-3xl font-bold mt-1">Professional Communication</h1><p className="text-slate-500 mt-2 leading-6">Write messages that are clear, respectful and easy for recruiters to act on.</p></div></div>
      </header>

      <section className="bg-white border rounded-2xl p-6">
        <h2 className="text-xl font-semibold">The habits recruiters notice</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-5">{habits.map((x) => <div key={x} className="flex gap-3 text-slate-700 leading-6"><CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-1" />{x}</div>)}</div>
      </section>

      <section className="mt-7">
        <h2 className="text-xl font-semibold mb-4">Ready-to-adapt message templates</h2>
        <div className="space-y-4">
          {templates.map((t) => <article key={t.title} className="bg-white border rounded-2xl p-6"><div className="flex justify-between gap-4"><h3 className="font-semibold">{t.title}</h3><button onClick={() => copy(t.text, t.title)} className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">{copied === t.title ? <CheckCircle2 size={16} /> : <Copy size={16} />}{copied === t.title ? "Copied" : "Copy"}</button></div><p className="mt-3 text-slate-600 leading-6 whitespace-pre-wrap">{t.text}</p></article>)}
        </div>
      </section>

      <ResourceSources sources={sources} />
    </article>
  );
}
