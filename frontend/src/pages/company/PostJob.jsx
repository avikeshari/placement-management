import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const initialForm = {
  title: "",
  location: "",
  salary: "",
  minimumCGPA: "",
  maxBacklogs: "0",
  minimumGraduationYear: "",
  maximumGraduationYear: "",
  eligibleBranches: "",
  description: "",
  skills: "",
  deadline: ""
};

export default function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const today = useMemo(getLocalDate, []);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const title = formData.title.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();
    const skills = formData.skills.split(",").map((item) => item.trim()).filter(Boolean);
    const eligibleBranches = formData.eligibleBranches.split(",").map((item) => item.trim()).filter(Boolean);
    const salary = Number(formData.salary);
    const minimumCGPA = Number(formData.minimumCGPA);
    const maxBacklogs = Number(formData.maxBacklogs);

    if (!title) return toast.error("Job title is required");
    if (!location) return toast.error("Location is required");
    if (description.length < 10) return toast.error("Job description must contain at least 10 characters");
    if (!skills.length) return toast.error("At least one required skill is required");
    if (!Number.isFinite(salary) || salary <= 0) return toast.error("Enter a valid salary");
    if (!Number.isFinite(minimumCGPA) || minimumCGPA < 0 || minimumCGPA > 10) return toast.error("Enter a valid minimum CGPA between 0 and 10");
    if (!Number.isInteger(maxBacklogs) || maxBacklogs < 0) return toast.error("Maximum backlogs must be a non-negative integer");

    if (formData.deadline && formData.deadline < today) {
      return toast.error("Application deadline must be after today");
    }

    const minYear = formData.minimumGraduationYear ? Number(formData.minimumGraduationYear) : undefined;
    const maxYear = formData.maximumGraduationYear ? Number(formData.maximumGraduationYear) : undefined;
    if (minYear !== undefined && (!Number.isInteger(minYear) || minYear < 2000 || minYear > 2100)) return toast.error("Enter a valid minimum graduation year");
    if (maxYear !== undefined && (!Number.isInteger(maxYear) || maxYear < 2000 || maxYear > 2100)) return toast.error("Enter a valid maximum graduation year");
    if (minYear !== undefined && maxYear !== undefined && minYear > maxYear) return toast.error("Minimum graduation year cannot exceed maximum graduation year");

    try {
      setLoading(true);
      await api.post("/jobs", {
        title,
        description,
        location,
        salary,
        minimumCGPA,
        maxBacklogs,
        eligibleBranches,
        minimumGraduationYear: minYear,
        maximumGraduationYear: maxYear,
        requiredSkills: skills,
        type: formData.type === "internship" ? "internship" : "job",
        ...(formData.deadline ? { deadline: formData.deadline } : {})
      });
      toast.success("Job published successfully");
      setFormData(initialForm);
      navigate("/company/jobs");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to publish job"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Post a Job</h1>
        <p className="text-slate-500 mt-2">Create a placement opportunity with server-enforced eligibility rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <label className="md:col-span-2 block text-sm font-medium">Job Title *<input name="title" value={formData.title} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" placeholder="Software Developer" /></label>
          <label className="block text-sm font-medium">Location *<input name="location" value={formData.location} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" placeholder="Bengaluru / Remote" /></label>
          <label className="block text-sm font-medium">Opportunity Type<select name="type" value={formData.type || "job"} onChange={handleChange} className="mt-2 w-full border rounded-lg px-3 py-2.5"><option value="job">Job</option><option value="internship">Internship</option></select></label>
          <label className="block text-sm font-medium">Salary / Package *<input name="salary" type="number" min="1" step="0.01" value={formData.salary} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Minimum CGPA *<input name="minimumCGPA" type="number" min="0" max="10" step="0.01" value={formData.minimumCGPA} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Maximum Backlogs *<input name="maxBacklogs" type="number" min="0" step="1" value={formData.maxBacklogs} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Minimum Graduation Year<input name="minimumGraduationYear" type="number" min="2000" max="2100" value={formData.minimumGraduationYear} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Maximum Graduation Year<input name="maximumGraduationYear" type="number" min="2000" max="2100" value={formData.maximumGraduationYear} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <label className="md:col-span-2 block text-sm font-medium">Eligible Branches<input name="eligibleBranches" value={formData.eligibleBranches} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" placeholder="CSE, ECE (leave blank for all branches)" /></label>
          <label className="md:col-span-2 block text-sm font-medium">Required Skills *<input name="skills" value={formData.skills} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" placeholder="React, Node.js, MongoDB" /></label>
          <label className="block text-sm font-medium">Application Deadline<input name="deadline" type="date" min={today} value={formData.deadline} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" /></label>
          <div className="text-xs text-slate-500 self-end pb-2">Deadline is validated again by the backend using an absolute UTC timestamp.</div>
          <label className="md:col-span-2 block text-sm font-medium">Job Description *<textarea name="description" rows="7" value={formData.description} onChange={handleChange} disabled={loading} className="mt-2 w-full border rounded-lg px-3 py-2.5" placeholder="Describe responsibilities, requirements and expectations..." /></label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/company/jobs")} disabled={loading} className="border px-5 py-2.5 rounded-lg">Cancel</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400">{loading ? "Publishing..." : "Publish Job"}</button>
        </div>
      </form>
    </section>
  );
}
