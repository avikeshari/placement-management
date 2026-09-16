import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, ClipboardCheck, ExternalLink, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import ResourceSources from "./ResourceSources";

const initialData = { profile: null, academic: null, applications: [], interviews: [], drives: [] };

function completedProfile(profile) {
  if (!profile) return false;
  return Boolean(
    profile.user?.name &&
    profile.user?.email &&
    profile.college &&
    profile.course &&
    profile.branch &&
    profile.graduationYear
  );
}

function isCurrentDrive(drive) {
  if (!drive) return false;
  const now = Date.now();
  const end = new Date(drive.endAt).getTime();
  return (drive.status === "open" || drive.status === "planned") && Number.isFinite(end) && end >= now;
}

function isParticipant(drive, userId) {
  return Boolean(userId && Array.isArray(drive?.participants) && drive.participants.some((id) => String(id?._id || id) === String(userId)));
}

export default function PlacementChecklist() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get("/profile/me"),
        api.get("/academic/me"),
        api.get("/applications/my"),
        api.get("/interviews/my"),
        api.get("/drives"),
      ]);
      if (!active) return;

      const nextErrors = [];
      const next = { ...initialData };
      const [profile, academic, applications, interviews, drives] = results;
      if (profile.status === "fulfilled") next.profile = profile.value.data.profile || null; else nextErrors.push("profile");
      if (academic.status === "fulfilled") next.academic = academic.value.data.record || null; else nextErrors.push("academic");
      if (applications.status === "fulfilled") next.applications = applications.value.data.applications || []; else nextErrors.push("applications");
      if (interviews.status === "fulfilled") next.interviews = interviews.value.data.interviews || []; else nextErrors.push("interviews");
      if (drives.status === "fulfilled") next.drives = drives.value.data.drives || []; else nextErrors.push("drives");
      setData(next);
      setErrors(nextErrors);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const checklist = useMemo(() => {
    const { profile, academic, applications, interviews, drives } = data;
    const skills = profile?.skills || [];
    const projects = profile?.projects || [];
    const experience = profile?.experience || [];
    const certifications = profile?.certifications || [];
    const preferences = (profile?.jobInterests?.length || 0) + (profile?.preferredLocations?.length || 0) + (profile?.preferredJobTypes?.length || 0);
    const activeApplications = applications.filter((a) => a.status !== "withdrawn");
    const scheduledInterviews = interviews.filter((i) => i.status === "scheduled");
    const pendingResponses = scheduledInterviews.filter((i) => (i.studentResponse || "pending") === "pending");
    const availableDrives = drives.filter(isCurrentDrive);
    const joinedDrive = availableDrives.some((drive) => isParticipant(drive, profile?.user?._id || profile?.user));

    return [
      { id: "profile", title: "Complete your student profile", detail: "Name, college, course, branch and graduation year are filled in.", done: completedProfile(profile), to: "/student/profile", action: "Open Profile" },
      { id: "academic", title: "Verify your academic record", detail: "Your academic record must be marked verified by the placement office.", done: Boolean(academic?.verified), to: "/student/profile", action: "View Profile" },
      { id: "resume", title: "Upload your resume", detail: profile?.resume?.url ? `Current resume: ${profile.resume.originalName || "Uploaded resume"}.` : "Upload a current PDF, DOC or DOCX resume.", done: Boolean(profile?.resume?.url), to: "/student/profile", action: "Open Profile" },
      { id: "skills", title: "Add your skills", detail: `${skills.length} skill${skills.length === 1 ? "" : "s"} currently listed.`, done: skills.length > 0, to: "/student/profile", action: "Add Skills" },
      { id: "projects", title: "Add projects or experience", detail: `${projects.length + experience.length} project/experience entr${projects.length + experience.length === 1 ? "y" : "ies"} currently listed.`, done: projects.length > 0 || experience.length > 0, to: "/student/profile", action: "Update Profile" },
      { id: "certifications", title: "Add relevant certifications", detail: `${certifications.length} certification${certifications.length === 1 ? "" : "s"} currently listed.`, done: certifications.length > 0, to: "/student/profile", action: "Update Profile" },
      { id: "preferences", title: "Set job preferences", detail: `${preferences} preference value${preferences === 1 ? "" : "s"} configured across interests, locations and job types.`, done: preferences > 0, to: "/student/settings", action: "Open Preferences" },
      { id: "application", title: "Start tracking applications", detail: `${activeApplications.length} active application${activeApplications.length === 1 ? "" : "s"} found.`, done: activeApplications.length > 0, to: "/student/jobs", action: "Browse Jobs" },
      { id: "drive", title: "Register for a placement drive", detail: availableDrives.length ? (joinedDrive ? "You are registered for at least one current placement drive." : `${availableDrives.length} current drive${availableDrives.length === 1 ? "" : "s"} available for registration.`) : "No current placement drive is available right now.", done: joinedDrive, applicable: availableDrives.length > 0, to: "/student/drives", action: "View Drives" },
      { id: "interview-response", title: "Respond to interview invitations", detail: scheduledInterviews.length ? (pendingResponses ? `${pendingResponses.length} interview invitation${pendingResponses.length === 1 ? "" : "s"} still need a response.` : "All scheduled interview invitations have a response.") : "This becomes relevant when a company schedules an interview.", done: scheduledInterviews.length > 0 && pendingResponses === 0, applicable: scheduledInterviews.length > 0, to: "/student/interviews", action: "View Interviews" },
      { id: "interview", title: "Review your interview schedule", detail: scheduledInterviews.length ? `${scheduledInterviews.length} scheduled interview${scheduledInterviews.length === 1 ? "" : "s"} found.` : "No scheduled interviews are currently available.", done: scheduledInterviews.length > 0, applicable: scheduledInterviews.length > 0, to: "/student/interviews", action: "View Interviews" },
    ];
  }, [data]);

  const applicableItems = checklist.filter((item) => item.applicable !== false);
  const completed = applicableItems.filter((item) => item.done).length;
  const percent = applicableItems.length ? Math.round((completed / applicableItems.length) * 100) : 0;

  if (loading) return <div className="flex items-center gap-3 text-slate-500"><LoaderCircle className="animate-spin" size={20} /> Loading your placement readiness...</div>;

  return (
    <article className="max-w-5xl">
      <Link to="/student/resources" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline mb-6"><ArrowLeft size={16} /> Back to Career Resources</Link>
      <header className="bg-white border rounded-2xl p-7 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><ClipboardCheck size={24} /></div>
          <div><p className="text-sm font-semibold text-blue-600">Personalized career tool</p><h1 className="text-3xl font-bold mt-1">Placement Readiness Checklist</h1><p className="text-slate-500 mt-2 leading-6">Your progress is calculated from your actual profile, verified academic record, resume, applications, interviews and available placement drives.</p></div>
        </div>
      </header>

      <section className="bg-white border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-3"><div><p className="text-sm text-slate-500">Overall readiness</p><p className="text-3xl font-bold">{percent}%</p></div><p className="text-sm font-semibold text-slate-600">{completed} of {applicableItems.length} applicable steps complete</p></div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${percent}%` }} /></div>
        {errors.length > 0 && <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">Some placement data could not be loaded. The checklist is showing the information that was available.</p>}
      </section>

      <div className="space-y-3">
        {checklist.map((item) => (
          <article key={item.id} className={`bg-white border rounded-2xl p-5 flex items-start gap-4 ${item.done ? "border-emerald-200" : "border-slate-200"}`}>
            {item.done ? <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={24} /> : <Circle className="text-slate-300 shrink-0 mt-0.5" size={24} />}
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.title}</h2>{item.done && <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Complete</span>}{item.applicable === false && <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Not applicable now</span>}</div><p className="text-sm text-slate-500 mt-1">{item.detail}</p></div>
            <Link to={item.to} className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">{item.action}<ExternalLink size={14} /></Link>
          </article>
        ))}
      </div>

      <ResourceSources sources={[{ label: "UC Davis Career Center — Resumes and Materials", url: "https://careercenter.ucdavis.edu/resumes-and-materials" }, { label: "UC Davis Career Center — Interview Preparation", url: "https://careercenter.ucdavis.edu/interviews-and-offers/questions-and-prep" }, { label: "UC Davis Career Center — Professional Communication", url: "https://careercenter.ucdavis.edu/resumes-and-materials/professional-communication" }]} />
    </article>
  );
}
