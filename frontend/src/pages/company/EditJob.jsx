import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import getErrorMessage from "../../utils/getErrorMessage";

const localDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const today = useMemo(localDate, []);
  const [form, setForm] = useState({ title: "", type: "job", description: "", location: "", salary: "", minimumCGPA: "", maxBacklogs: "0", eligibleBranches: "", minimumGraduationYear: "", maximumGraduationYear: "", requiredSkills: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then(({ data }) => {
        const job = data.job;
        setForm({
          title: job.title || "",
          type: job.type || "job",
          description: job.description || "",
          location: job.location || "",
          salary: job.salary ?? "",
          minimumCGPA: job.minimumCGPA ?? "",
          maxBacklogs: job.maxBacklogs ?? 0,
          eligibleBranches: (job.eligibleBranches || []).join(", "),
          minimumGraduationYear: job.minimumGraduationYear ?? "",
          maximumGraduationYear: job.maximumGraduationYear ?? "",
          requiredSkills: (job.requiredSkills || []).join(", "),
          deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : ""
        });
      })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load job.")))
      .finally(() => setLoading(false));
  }, [jobId]);

  const submit = async (event) => {
    event.preventDefault();
    const skills = form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const branches = form.eligibleBranches.split(",").map((s) => s.trim()).filter(Boolean);
    const salary = Number(form.salary);
    const cgpa = Number(form.minimumCGPA);
    const maxBacklogs = Number(form.maxBacklogs);
    if (!form.title.trim() || form.description.trim().length < 10) return toast.error("Title and description are required");
    if (!Number.isFinite(salary) || salary <= 0) return toast.error("Enter a valid salary");
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) return toast.error("Enter a valid CGPA");
    if (!Number.isInteger(maxBacklogs) || maxBacklogs < 0) return toast.error("Maximum backlogs must be a non-negative integer");
    if (!skills.length) return toast.error("At least one required skill is required");
    if (form.deadline && form.deadline < today) return toast.error("Application deadline cannot be moved into the past");

    const minYear = form.minimumGraduationYear ? Number(form.minimumGraduationYear) : undefined;
    const maxYear = form.maximumGraduationYear ? Number(form.maximumGraduationYear) : undefined;
    if (minYear !== undefined && maxYear !== undefined && minYear > maxYear) return toast.error("Minimum graduation year cannot exceed maximum graduation year");

    try {
      setSaving(true);
      await api.put(`/jobs/${jobId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        location: form.location.trim(),
        salary,
        minimumCGPA: cgpa,
        maxBacklogs,
        eligibleBranches: branches,
        minimumGraduationYear: minYear,
        maximumGraduationYear: maxYear,
        requiredSkills: skills,
        deadline: form.deadline || null
      });
      toast.success("Job updated successfully");
      navigate("/company/jobs");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update job."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading job..." />;

  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Job</h1>
      <form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-5">
        {[["title", "Job Title"], ["location", "Location"], ["salary", "Salary"], ["minimumCGPA", "Minimum CGPA"], ["maxBacklogs", "Maximum Backlogs"], ["minimumGraduationYear", "Minimum Graduation Year"], ["maximumGraduationYear", "Maximum Graduation Year"], ["eligibleBranches", "Eligible Branches (comma separated)"], ["requiredSkills", "Required Skills (comma separated)"], ["deadline", "Deadline"]].map(([name, label]) => (
          <label key={name} className="block text-sm font-medium">
            {label}{["title", "location", "salary", "minimumCGPA", "maxBacklogs", "requiredSkills"].includes(name) ? " *" : ""}
            <input
              name={name}
              type={name === "deadline" ? "date" : ["salary", "minimumCGPA", "maxBacklogs", "minimumGraduationYear", "maximumGraduationYear"].includes(name) ? "number" : "text"}
              min={name === "deadline" ? today : undefined}
              value={form[name]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              className="mt-2 w-full border rounded-lg px-3 py-2.5"
            />
          </label>
        ))}
        <label className="block text-sm font-medium">Description *<textarea rows="7" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
        <div className="flex gap-3"><button disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400">{saving ? "Saving..." : "Save Changes"}</button><button type="button" onClick={() => navigate("/company/jobs")} className="border px-5 py-2.5 rounded-lg">Cancel</button></div>
      </form>
    </section>
  );
};

export default EditJob;
