import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import getErrorMessage from "../../utils/getErrorMessage";

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", location: "", salary: "", minimumCGPA: "", requiredSkills: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(({ data }) => {
      const job = data.job;
      setForm({ title: job.title || "", description: job.description || "", location: job.location || "", salary: job.salary ?? "", minimumCGPA: job.minimumCGPA ?? "", requiredSkills: (job.requiredSkills || []).join(", "), deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : "" });
    }).catch((error) => toast.error(getErrorMessage(error, "Unable to load job."))).finally(() => setLoading(false));
  }, [jobId]);

  const submit = async (e) => {
    e.preventDefault();
    const skills = form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const salary = Number(form.salary); const cgpa = Number(form.minimumCGPA);
    if (!form.title.trim() || !form.description.trim()) return toast.error("Title and description are required");
    if (!Number.isFinite(salary) || salary <= 0) return toast.error("Enter a valid salary");
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) return toast.error("Enter a valid CGPA between 0 and 10");
    if (!skills.length) return toast.error("At least one required skill is required");
    try { setSaving(true); await api.put(`/jobs/${jobId}`, { ...form, title: form.title.trim(), description: form.description.trim(), salary, minimumCGPA: cgpa, requiredSkills: skills }); toast.success("Job updated successfully"); navigate("/company/jobs"); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to update job.")); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader text="Loading job..." />;
  return <section className="max-w-3xl"><h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Job</h1><form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-5">
    {[["title","Job Title"],["location","Location"],["salary","Salary"],["minimumCGPA","Minimum CGPA"],["requiredSkills","Required Skills (comma separated)"],["deadline","Deadline"]].map(([name,label]) => <div key={name}><label className="block text-sm font-medium mb-2">{label} *</label><input type={name === "deadline" ? "date" : name === "salary" || name === "minimumCGPA" ? "number" : "text"} step={name === "minimumCGPA" ? "0.1" : "any"} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" /></div>)}
    <div><label className="block text-sm font-medium mb-2">Description *</label><textarea rows="7" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" /></div>
    <div className="flex gap-3"><button disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg disabled:bg-slate-400">{saving ? "Saving..." : "Save Changes"}</button><button type="button" onClick={() => navigate("/company/jobs")} className="border px-5 py-2.5 rounded-lg">Cancel</button></div>
  </form></section>;
};
export default EditJob;
