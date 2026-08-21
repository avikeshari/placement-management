import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import ResourceSources from "./ResourceSources";

const sections = [
  ["Start with the target role", "Read the job description first. Select the education, skills, projects and experience that are genuinely relevant to the role instead of sending the same generic resume everywhere."],
  ["Contact and headline", "Use your real name and reliable contact details. A professional email and, where useful, a portfolio or LinkedIn link make it easier for a recruiter to follow up."],
  ["Education", "Keep degree, college, branch/major and expected graduation information accurate. Use a consistent format and place the most recent education first."],
  ["Experience and projects", "Use short accomplishment-focused bullets. Explain what you did, the tools or skills involved and the result. Quantify outcomes when you can support the number."],
  ["Skills", "List skills you can explain and demonstrate. Prioritize skills that genuinely match the position, and avoid adding keywords you cannot discuss in an interview."],
  ["Formatting and proofreading", "Use clear section headings, consistent spacing and readable typography. Proofread names, dates, links and technical terms; do not rely only on spell-check."],
];

const checklist = [
  "The resume is tailored to the role.",
  "Education and graduation details match your placement profile.",
  "Experience and project bullets show contribution and outcomes.",
  "Relevant skills are easy to find and can be demonstrated.",
  "Formatting is consistent and easy to scan.",
  "Contact details and links are correct.",
  "The uploaded copy in your profile is the current version.",
];

const sources = [
  { label: "UC Davis Career Center — Resumes", url: "https://careercenter.ucdavis.edu/resumes-and-materials/resumes" },
  { label: "UCLA Career Center — Resume Formatting Checklist", url: "https://career.ucla.edu/resources/resume-formatting-tips-checklist/" },
  { label: "Case Western Reserve — Resume Checklist", url: "https://case.edu/studentlife/careercenter/career-development/career-resources/tips-job-seekers/resumes/resume-checklist" },
];

export default function ResumePreparation() {
  return (
    <article className="max-w-5xl">
      <Link to="/student/resources" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Career Resources
      </Link>
      <header className="bg-white border rounded-2xl p-7 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-blue-600">Career guide · 5 min read</p>
            <h1 className="text-3xl font-bold mt-1">Resume Preparation</h1>
            <p className="text-slate-500 mt-2 leading-6">Build a concise, evidence-based resume that helps a recruiter quickly understand what you can contribute.</p>
          </div>
        </div>
      </header>

      <div className="space-y-5">
        {sections.map(([title, text]) => (
          <section key={title} className="bg-white border rounded-2xl p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-slate-600 mt-2 leading-7">{text}</p>
          </section>
        ))}
      </div>

      <section className="bg-white border rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold">Final resume check</h2>
        <div className="mt-4 space-y-3">
          {checklist.map((item) => (
            <div key={item} className="flex gap-3 text-slate-700"><CheckCircle2 size={19} className="text-emerald-600 shrink-0 mt-0.5" /><span>{item}</span></div>
          ))}
        </div>
        <Link to="/student/profile" className="inline-flex mt-6 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700">Open My Profile</Link>
      </section>

      <ResourceSources sources={sources} />
    </article>
  );
}
