import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import { Link } from "react-router-dom";
import ResourceSources from "./ResourceSources";

const stages = [
  ["1. Know the role", "Re-read the job description and identify the skills, responsibilities and qualifications the employer emphasizes. Prepare examples from your academic, project, work or leadership experience that demonstrate those requirements."],
  ["2. Know the company", "Review the company's products or services, mission, customers and recent public information. Your goal is to understand why the role exists and why the organization interests you."],
  ["3. Prepare your stories", "Prepare several different examples rather than memorizing one answer. Choose situations that show problem-solving, teamwork, leadership, learning and handling challenges."],
  ["4. Use STAR for behavioural questions", "STAR means Situation, Task, Action and Result. Keep the context brief, focus on what you personally did, and finish with the outcome or lesson."],
  ["5. Practice technical explanations", "Review the technologies and concepts listed in the job description. Practice explaining your projects clearly, including trade-offs, challenges and what you would improve."],
  ["6. Finish professionally", "Prepare two or three thoughtful questions about the role, team, expectations or next steps. After the interview, record follow-up actions and respond promptly to recruiter requests."],
];

const dayOf = ["Resume ready", "Job description reviewed", "Company researched", "Technical topics revised", "Camera and microphone tested for online interviews", "Questions prepared"];

const sources = [
  { label: "UC Davis Career Center — Interview Questions & Preparation", url: "https://careercenter.ucdavis.edu/interviews-and-offers/questions-and-prep" },
  { label: "USC Career Center — Interview Preparation", url: "https://careers.usc.edu/channels/prepare-for-an-interview/" },
  { label: "UK National Careers Service — STAR Method", url: "https://nationalcareers.service.gov.uk/careers-advice/interview-advice/the-star-method" },
];

export default function InterviewPreparation() {
  return (
    <article className="max-w-5xl">
      <Link to="/student/resources" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline mb-6"><ArrowLeft size={16} /> Back to Career Resources</Link>
      <header className="bg-white border rounded-2xl p-7 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Video size={24} /></div>
          <div><p className="text-sm font-semibold text-blue-600">Career guide · 6 min read</p><h1 className="text-3xl font-bold mt-1">Interview Preparation</h1><p className="text-slate-500 mt-2 leading-6">Prepare for HR, behavioural, technical and online interviews with a repeatable preparation routine.</p></div>
        </div>
      </header>

      <div className="space-y-5">
        {stages.map(([title, text]) => <section key={title} className="bg-white border rounded-2xl p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="text-slate-600 mt-2 leading-7">{text}</p></section>)}
      </div>

      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-6">
        <h2 className="font-semibold text-xl">Interview-day checklist</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
          {dayOf.map((x) => <div key={x} className="flex gap-2"><CheckCircle2 size={17} className="text-blue-600 shrink-0" />{x}</div>)}
        </div>
        <Link to="/student/interviews" className="inline-flex mt-5 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700">View My Interviews</Link>
      </section>

      <ResourceSources sources={sources} />
    </article>
  );
}
