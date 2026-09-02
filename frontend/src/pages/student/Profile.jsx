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
  Trash2,
  Download
} from "lucide-react";

import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import ConfirmDialog from "../../components/ConfirmDialog";
import getErrorMessage from "../../utils/getErrorMessage";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openingResume, setOpeningResume] = useState(false);
  const [downloadingResume, setDownloadingResume] =
    useState(false);
  const [confirmAction, setConfirmAction] =
    useState(null);
  const [error, setError] = useState("");
  const [resume, setResume] = useState(null);
  const [academicRecord, setAcademicRecord] =
    useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Profile and academic data are loaded
       * independently. An academic-record problem
       * must never hide the student's profile/resume.
       */
      const profileResponse =
        await api.get("/profile/me");

      setProfile(
        profileResponse.data.profile
      );

      try {
        const academicResponse =
          await api.get("/academic/me");

        setAcademicRecord(
          academicResponse.data.record ||
            null
        );
      } catch (academicError) {
        console.error(
          "Academic record loading failed:",
          academicError
        );

        setAcademicRecord(null);
      }
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

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        phone: profile.phone || "",
        college: profile.college || "",
        course: profile.course || "",
        branch: profile.branch || "",
        graduationYear:
          profile.graduationYear || "",
        cgpa: profile.cgpa || "",
        skills:
          Array.isArray(profile.skills)
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

  const handleResumeChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const validExtension =
      /\.(pdf|doc|docx)$/i.test(
        selectedFile.name
      );

    if (
      !allowedTypes.includes(
        selectedFile.type
      ) &&
      !validExtension
    ) {
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
      // Read the file input as a fallback. This also handles browsers
      // where the React state has not updated before the button click.
      const fileInput = document.getElementById("resume");
      const selectedResume =
        resume || fileInput?.files?.[0] || null;

      if (!selectedResume) {
        toast.error(
          "Please choose a PDF, DOC or DOCX resume before uploading."
        );
        return;
      }

      try {
        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "resume",
          selectedResume
        );

        const response =
          await api.post(
            "/profile/resume",
            formData
          );

        setProfile(
          (previous) => ({
            ...previous,
            resume:
              response.data.resume
          })
        );

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

  /*
   * Fetch the resume through our backend.
   *
   * This avoids sending the student directly
   * to a Cloudinary URL and keeps resume access
   * behind authentication.
   */
  const fetchResumeBlob =
    async (download = false) => {
      const response =
        await api.get(
          `/profile/resume${
            download
              ? "?download=true"
              : ""
          }`,
          {
            responseType: "blob"
          }
        );

      return response.data;
    };

  const handleResumeView =
    async () => {
      if (!profile.resume?.url) {
        toast.error(
          "No resume found."
        );
        return;
      }

      try {
        setOpeningResume(true);

        const blob =
          await fetchResumeBlob(
            false
          );

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const newWindow =
          window.open(
            blobUrl,
            "_blank",
            "noopener,noreferrer"
          );

        if (!newWindow) {
          /*
           * Popup blockers can prevent
           * window.open. Give the user a
           * fallback download instead.
           */
          const link =
            document.createElement(
              "a"
            );

          link.href = blobUrl;
          link.download =
            profile.resume
              .originalName ||
            "resume";

          document.body.appendChild(
            link
          );

          link.click();
          link.remove();
        }

        /*
         * Give the browser enough time to
         * consume the blob before revoking it.
         */
        window.setTimeout(() => {
          window.URL.revokeObjectURL(
            blobUrl
          );
        }, 60000);
      } catch (error) {
        console.error(
          "Resume view error:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Unable to open resume. Please re-upload it."
          )
        );
      } finally {
        setOpeningResume(false);
      }
    };

  const handleResumeDownload =
    async () => {
      if (!profile.resume?.url) {
        toast.error(
          "No resume found."
        );
        return;
      }

      try {
        setDownloadingResume(true);

        const blob =
          await fetchResumeBlob(
            true
          );

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = blobUrl;
        link.download =
          profile.resume
            .originalName ||
          "resume";

        document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        window.setTimeout(() => {
          window.URL.revokeObjectURL(
            blobUrl
          );
        }, 60000);
      } catch (error) {
        console.error(
          "Resume download error:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Unable to download resume."
          )
        );
      } finally {
        setDownloadingResume(false);
      }
    };

  const handleResumeDelete =
    async () => {
      if (!profile.resume?.url) {
        toast.error(
          "No resume to delete."
        );
        return;
      }

      setConfirmAction(
        "resume"
      );
    };

  const doResumeDelete = async () => {
      try {
        setUploading(true);

        await api.delete(
          "/profile/resume"
        );

        setProfile(
          (previous) => ({
            ...previous,
            resume: undefined
          })
        );

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
        setConfirmAction(null);
      }
    };

  const handleDeleteAccount =
    async () => {
      setConfirmAction(
        "account"
      );
    };

  const doDeleteAccount = async () => {
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
        setConfirmAction(null);
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
      {academicRecord && (
        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-blue-900">
            Official Academic Information
          </h2>

          <p className="text-sm text-blue-700 mt-1">
            Imported by the placement administrator.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
            <div>
              <span className="text-slate-500">
                Enrollment
              </span>

              <p className="font-semibold">
                {academicRecord.enrollmentNumber ||
                  "-"}
              </p>
            </div>

            <div>
              <span className="text-slate-500">
                Branch
              </span>

              <p className="font-semibold">
                {academicRecord.branch ||
                  "-"}
              </p>
            </div>

            <div>
              <span className="text-slate-500">
                CGPA
              </span>

              <p className="font-semibold">
                {academicRecord.cgpa ??
                  "-"}
              </p>
            </div>

            <div>
              <span className="text-slate-500">
                Backlogs
              </span>

              <p className="font-semibold">
                {academicRecord.backlogs === undefined || academicRecord.backlogs === null
                  ? "-"
                  : academicRecord.backlogs}
              </p>
            </div>
          </div>
        </section>
      )}

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
        onSubmit={handleSaveProfile}
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
            ([name, label, type]) => (
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
                <p className="font-medium text-green-900">
                  Current Resume
                </p>

                <p className="text-sm text-green-700 truncate mt-1">
                  {profile.resume.originalName ||
                    "Uploaded resume"}
                </p>

                {profile.resume.format && (
                  <p className="text-xs text-green-600 mt-1 uppercase">
                    {profile.resume.format}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={
                    handleResumeView
                  }
                  disabled={
                    openingResume ||
                    downloadingResume
                  }
                  className="inline-flex items-center justify-center gap-2 bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  <ExternalLink
                    size={17}
                  />

                  {openingResume
                    ? "Opening..."
                    : "View Resume"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleResumeDownload
                  }
                  disabled={
                    openingResume ||
                    downloadingResume
                  }
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg"
                >
                  <Download
                    size={17}
                  />

                  {downloadingResume
                    ? "Downloading..."
                    : "Download Resume"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleResumeDelete
                  }
                  disabled={
                    uploading ||
                    openingResume ||
                    downloadingResume
                  }
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg"
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
            <p className="font-medium text-amber-900">
              No resume uploaded
            </p>

            <p className="text-sm text-amber-700 mt-1">
              Upload a resume before applying for jobs.
            </p>
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
                <Upload
                  size={18}
                />

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

      <section className="bg-white border border-red-200 rounded-2xl shadow-sm p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-xl font-semibold text-red-700">
              Delete Account
            </h2>

            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Permanently delete your account,
              profile, applications, interviews
              and uploaded resume. This action
              cannot be undone.
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
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            <Trash2 size={18} />

            {saving
              ? "Deleting..."
              : "Delete Account"}
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmAction === "resume"}
        title="Delete resume?"
        message="Are you sure you want to delete your resume? This cannot be undone."
        confirmText="Delete Resume"
        danger
        loading={uploading}
        onConfirm={doResumeDelete}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "account"}
        title="Delete your account?"
        message="Delete your account permanently? Your profile, applications, interviews and uploaded resume will be removed. This cannot be undone."
        confirmText="Delete Account"
        danger
        loading={saving}
        onConfirm={doDeleteAccount}
        onCancel={() => setConfirmAction(null)}
      />
    </section>
  );
};

export default Profile;
