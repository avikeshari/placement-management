const JobCard = ({ job, onApply, applying, applied, eligible = true }) => {
  return (
    <article className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-semibold">{job.title}</h2>
        <p className="text-slate-500 mt-1">{job.company?.name || "Company"}</p>
        <p className="mt-4 text-slate-700 line-clamp-3">{job.description}</p>
        <div className="mt-5 text-sm space-y-2">
          <p><strong>Location:</strong> {job.location || "Not specified"}</p>
          <p><strong>Salary:</strong> {job.salary ?? "Not specified"}</p>
          <p><strong>Minimum CGPA:</strong> {job.minimumCGPA ?? 0}</p>
          <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Not specified"}</p>
          <p><strong>Skills:</strong> {job.requiredSkills?.length ? job.requiredSkills.join(", ") : "Not specified"}</p>
        </div>
      </div>
      {!eligible && <p className="mt-4 text-sm text-red-600">You do not meet the minimum CGPA requirement.</p>}
      <button
        disabled={applying || applied || !eligible}
        onClick={() => onApply(job._id)}
        className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg transition"
      >
        {applied ? "Already Applied" : applying ? "Applying..." : "Apply Now"}
      </button>
    </article>
  );
};

export default JobCard;
