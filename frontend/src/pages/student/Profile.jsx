import {
  useCallback,
  useEffect,
  useState
} from "react";

import toast from "react-hot-toast";

import {
  FileText,
  Upload,
  UserRound,
  Save,
  ExternalLink,
  Trash2
} from "lucide-react";

import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Profile = () => {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [resume, setResume] =
    useState(null);

  const loadProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/profile/me"
          );

        setProfile(
          response.data.profile
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to load your profile."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveProfile =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);

        const payload = {
          phone:
            profile.phone || "",
          college:
            profile.college || "",
          course:
            profile.course || "",
          branch:
            profile.branch || "",
          graduationYear:
            profile.graduationYear ||
            "",
          cgpa:
            profile.cgpa || "",
          skills:
            Array.isArray(
              profile.skills
            )
              ? profile.skills
              : profile.skills || ""
        };

        const response =
          await api.put(
            "/profile/me",
            payload
          );

        setProfile(
          response.data.profile
        );

        toast.success(
          "Profile updated successfully"
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to update profile."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const handleResumeChange =
    (event) => {
      const selectedFile =
        event.target.files?.[0];

      if (!selectedFile) {
        setResume(null);
        return;
      }

      const validExtension =
        /\.(pdf|doc|docx)$/i.test(
          selectedFile.name
        );

      if (!validExtension) {
        toast.error(
          "Only PDF, DOC and DOCX files are allowed."
        );

        event.target.value = "";
        setResume(null);
        return;
      }

      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        toast.error(
          "Resume must be smaller than 5 MB."
        );

        event.target.value = "";
        setResume(null);
        return;
      }

      setResume(selectedFile);
    };

  const handleResumeUpload =
    async () => {
      if (!resume) {
        toast.error(
          "Please select a resume first."
        );
        return;
      }

      try {
        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "resume",
          resume
        );

        const response =
          await api.post(
            "/profile/resume",
            formData
          );

        setProfile((previous) => ({
          ...previous,
          resume:
            response.data.resume
        }));

        setResume(null);

        const input =
          document.getElementById(
            "resume"
          );

        if (input) {
          input.value = "";
        }

        toast.success(
          "Resume uploaded successfully"
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to upload resume."
          )
        );
      } finally {
        setUploading(false);
      }
    };

  const handleResumeDelete =
    async () => {
      if (!profile.resume?.url) {
        toast.error(
          "No resume is currently uploaded."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "Delete your resume permanently?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setUploading(true);

        await api.delete(
          "/profile/resume"
        );

        setProfile((previous) => ({
          ...previous,
          resume: null
        }));

        toast.success(
          "Resume deleted successfully"
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to delete resume."
          )
        );
      } finally {
        setUploading(false);
      }
    };

  const handleDeleteAccount =
    async () => {
      const confirmed =
        window.confirm(
          "Delete your profile and account permanently? Your resume, applications and interviews will also be removed. This action cannot be undone."
        );

      if (!confirmed) {
        return;
      }

      try {
        setSaving(true);

        await api.delete(
          "/profile/me"
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        toast.success(
          "Account deleted successfully"
        );

        window.location.href =
          "/login";
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to delete account."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <Loader text="Loading your profile..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadProfile}
      />
    );
  }

  if (!profile) {
    return (
      <ErrorState
        message="Profile could not be loaded."
        onRetry={loadProfile}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
            <UserRound size={24} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Student Profile
            </h1>

            <p className="text-slate-500 mt-1">
              Keep your profile and resume up to date.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={
          handleSaveProfile
        }
        className="bg-white border rounded-2xl shadow-sm p-5 md:p-8"
      >
        <h2 className="text-xl font-semibold">
          Personal & Academic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {[
            ["phone", "Phone", "tel"],
            ["college", "College", "text"],
            ["course", "Course", "text"],
            ["branch", "Branch", "text"],
            [
              "graduationYear",
              "Graduation Year",
              "number"
            ],
            ["cgpa", "CGPA", "number"]
          ].map(
            ([
              name,
              label,
              type
            ]) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  {label}
                </label>

                <input
                  id={name}
                  name={name}
                  type={type}
                  step={
                    name === "cgpa"
                      ? "0.01"
                      : undefined
                  }
                  min={
                    name === "cgpa"
                      ? "0"
                      : name ===
                        "graduationYear"
                        ? "2000"
                        : undefined
                  }
                  max={
                    name === "cgpa"
                      ? "10"
                      : name ===
                        "graduationYear"
                        ? "2100"
                        : undefined
                  }
                  value={
                    profile[name] ??
                    ""
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )
          )}

          <div className="md:col-span-2">
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Skills
            </label>

            <input
              id="skills"
              name="skills"
              value={
                Array.isArray(
                  profile.skills
                )
                  ? profile.skills.join(
                    ", "
                  )
                  : profile.skills ||
                  ""
              }
              onChange={
                handleChange
              }
              placeholder="React, Node.js, MongoDB, Java"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-slate-500 mt-2">
              Separate multiple skills with commas.
            </p>
          </div>
        </div>

        <div className="mt-7 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>
      </form>

      <section className="bg-white border rounded-2xl shadow-sm p-5 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="bg-purple-100 text-purple-700 p-3 rounded-xl">
            <FileText size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Resume
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              PDF, DOC or DOCX · Maximum 5 MB
            </p>
          </div>
        </div>

        {profile.resume?.url ? (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-green-900">
                  Current Resume
                </p>

                <p className="text-sm text-green-700 truncate mt-1">
                  {profile.resume
                    .originalName ||
                    "Uploaded resume"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={
                    profile.resume
                      .url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-green-300 text-green-700 px-4 py-2.5 rounded-lg font-medium"
                >
                  <ExternalLink
                    size={17}
                  />
                  View Resume
                </a>

                <button
                  type="button"
                  onClick={
                    handleResumeDelete
                  }
                  disabled={
                    uploading
                  }
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold"
                >
                  <Trash2
                    size={17}
                  />

                  {uploading
                    ? "Deleting..."
                    : "Delete Resume"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-amber-900">
                  No resume uploaded
                </p>

                <p className="text-sm text-amber-700 mt-1">
                  Upload a resume before applying for jobs.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 bg-slate-300 text-slate-500 px-4 py-2.5 rounded-lg cursor-not-allowed"
              >
                <Trash2
                  size={17}
                />
                Delete Resume
              </button>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 md:p-8">
          <div className="text-center">
            <Upload
              size={36}
              className="mx-auto text-slate-400"
            />

            <h3 className="font-medium mt-4">
              {profile.resume
                ? "Replace your resume"
                : "Upload your resume"}
            </h3>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <label
                htmlFor="resume"
                className="cursor-pointer inline-flex items-center justify-center bg-slate-900 text-white px-5 py-2.5 rounded-lg"
              >
                Choose Resume
              </label>

              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={
                  handleResumeChange
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={
                  handleResumeUpload
                }
                disabled={
                  !resume ||
                  uploading
                }
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg"
              >
                <Upload size={18} />

                {uploading
                  ? "Uploading..."
                  : "Upload Resume"}
              </button>
            </div>

            {resume && (
              <div className="mt-5 bg-slate-50 border rounded-lg p-3 text-left">
                <p className="text-sm font-medium">
                  Selected file
                </p>

                <p className="text-sm text-slate-600 truncate mt-1">
                  {resume.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {(
                    resume.size /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-700 p-3 rounded-xl">
                <Trash2 size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-red-700">
                  Delete Profile & Account
                </h2>

                <p className="text-sm text-red-600 mt-1">
                  Permanently remove your profile, resume,
                  applications and interviews.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-4 max-w-2xl">
              This action permanently deletes your student
              account and associated data. It cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleDeleteAccount
            }
            disabled={
              saving || uploading
            }
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <Trash2 size={18} />

            {saving
              ? "Deleting..."
              : "Delete Profile & Account"}
          </button>
        </div>
      </section>
    </section>
  );
};

export default Profile;