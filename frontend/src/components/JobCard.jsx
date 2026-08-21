import { useState } from "react";

const JobCard = ({ job, onApply, applying, applied, eligible = true, eligibilityReasons = [], onSave, onFollowCompany }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <article className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-slate-500 mt-1">{job.company?.name || "Company"} {job.company?.isVerified ? <span className="text-xs text-emerald-600">✓ Verified</span> : null}</p>
          <p className="mt-4 text-slate-700 line-clamp-3">{job.description}</p>
          <div className="mt-5 text-sm space-y-2">
            <p><strong>Location:</strong> {job.location || "Not specified"}</p>
            <p><strong>Salary:</strong> {job.salary ?? "Not specified"}</p>
            <p><strong>Minimum CGPA:</strong> {job.minimumCGPA ?? 0}</p>
            <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN") : "Not specified"}</p>
            <p><strong>Skills:</strong> {job.requiredSkills?.length ? job.requiredSkills.join(", ") : "Not specified"}</p>
          </div>
        </div>

        {typeof job.matchScore === "number" && <div className="mt-3 rounded-lg bg-blue-50 text-blue-700 px-3 py-2 text-sm"><strong>{job.matchScore}% match</strong> — {job.recommendationReason}</div>}

        {job.eligibility && (
          <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${eligible ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            <strong>{eligible ? "✓ Eligible" : "Not eligible"}</strong>
            {eligible ? (job.minimumCGPA ? ` — CGPA ≥ ${job.minimumCGPA}` : "") : (eligibilityReasons.length ? ` — ${eligibilityReasons.join("; ")}` : " — Eligibility requirements are not met")}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave?.(job._id)}
            className="border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50"
          >
            Save Job
          </button>
          <button
            type="button"
            onClick={() => onFollowCompany?.(job.company?._id)}
            className="border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50"
          >
            Follow Company
          </button>
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50"
          >
            View Full Details
          </button>
          <button
            disabled={applying || applied || !eligible}
            onClick={() => onApply(job._id)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg transition"
          >
            {applied ? "Already Applied" : applying ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </article>

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <p className="text-slate-500 mt-1">{job.company?.name || "Company"} {job.company?.isVerified ? <span className="text-xs text-emerald-600">✓ Verified</span> : null}</p>
              </div>
              <button type="button" onClick={() => setShowDetails(false)} className="text-slate-500 hover:text-slate-900 text-xl">×</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
              <div><p className="text-slate-500">Location</p><p className="font-semibold mt-1">{job.location || "Not specified"}</p></div>
              <div><p className="text-slate-500">Salary / Package</p><p className="font-semibold mt-1">{job.salary ?? "Not specified"}</p></div>
              <div><p className="text-slate-500">Minimum CGPA</p><p className="font-semibold mt-1">{job.minimumCGPA ?? 0}</p></div>
              <div><p className="text-slate-500">Application Deadline</p><p className="font-semibold mt-1">{job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Not specified"}</p></div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Required Skills</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(job.requiredSkills || []).map((skill) => <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{skill}</span>)}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Job Description</h3>
              <p className="text-slate-600 whitespace-pre-line mt-2">{job.description || "No description provided."}</p>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDetails(false)} className="border px-5 py-2.5 rounded-lg">Close</button>
              <button
                type="button"
                disabled={applying || applied || !eligible}
                onClick={() => { setShowDetails(false); onApply(job._id); }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400"
              >
                {applied ? "Already Applied" : applying ? "Applying..." : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard;
