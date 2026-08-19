import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const initialForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  minimumCGPA: "",
  description: "",
  skills: "",
  deadline: ""
};

export default function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const title = formData.title.trim();
    const company = formData.company.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();
    const skills = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    // Validate text fields
    if (!title) {
      toast.error("Job title is required");
      return;
    }

    if (!company) {
      toast.error("Company name is required");
      return;
    }

    if (!location) {
      toast.error("Location is required");
      return;
    }

    if (!description) {
      toast.error("Job description is required");
      return;
    }

    if (skills.length === 0) {
      toast.error("At least one skill is required");
      return;
    }

    // Validate salary
    const salary = Number(formData.salary);

    if (!formData.salary || !Number.isFinite(salary) || salary <= 0) {
      toast.error("Enter a valid salary");
      return;
    }

    // Validate minimum CGPA
    const minimumCGPA = Number(formData.minimumCGPA);

    if (
      formData.minimumCGPA === "" ||
      !Number.isFinite(minimumCGPA) ||
      minimumCGPA < 0 ||
      minimumCGPA > 10
    ) {
      toast.error("Enter a valid minimum CGPA between 0 and 10");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        company,
        location,
        salary,
        minimumCGPA,
        description,
        requiredSkills: skills
      };

      // Only send deadline when one has actually been selected.
      if (formData.deadline) {
        payload.deadline = formData.deadline;
      }

      const response = await api.post(
        "/jobs",
        payload
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message || "Failed to publish job"
        );
      }

      toast.success(
        response.data?.message || "Job published successfully"
      );

      setFormData(initialForm);

      navigate("/company/jobs");
    } catch (error) {
      console.error("Publish job error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to publish job"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Post a Job
          </h1>

          <p className="mt-2 text-gray-600">
            Create a new job opening for students.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">

            {/* Job Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Job Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Company Name *
              </label>

              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. ABC Technologies"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Location *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore / Remote"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Salary */}
            <div>
              <label
                htmlFor="salary"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Salary / Package *
              </label>

              <input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 800000"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter the annual salary as a number, e.g. 800000.
              </p>
            </div>

            {/* Minimum CGPA */}
            <div>
              <label
                htmlFor="minimumCGPA"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Minimum CGPA *
              </label>

              <input
                id="minimumCGPA"
                name="minimumCGPA"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.minimumCGPA}
                onChange={handleChange}
                placeholder="e.g. 7.5"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter a value between 0 and 10.
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Application Deadline
              </label>

              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label
                htmlFor="skills"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Required Skills *
              </label>

              <input
                id="skills"
                name="skills"
                type="text"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, JavaScript"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate skills with commas.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Job Description *
              </label>

              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities and requirements..."
                disabled={loading}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/company/jobs")}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}