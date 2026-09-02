import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function AcademicRecord() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/academic/me")
      .then(({ data }) => setRecord(data.record || null))
      .catch((err) => setError(getErrorMessage(err, "Unable to load academic record.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading academic record..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  if (!record) {
    return <section><h1 className="text-3xl font-bold">Academic Records</h1><p className="text-slate-500 mt-2">No academic record has been imported for your account yet. Contact the placement administrator.</p></section>;
  }

  const fields = [
    ["Enrollment Number", record.enrollmentNumber || "—"],
    ["College", record.college || "—"],
    ["Course", record.course || "—"],
    ["Branch", record.branch || "—"],
    ["Graduation Year", record.graduationYear || "—"],
    ["CGPA", record.cgpa ?? "—"],
    ["Backlogs", record.backlogs ?? "—"]
  ];

  return <section>
    <div className="mb-6"><h1 className="text-3xl font-bold">Academic Records</h1><p className="text-slate-500 mt-2">Academic information imported and maintained by the placement office.</p></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {fields.map(([label, value]) => <div key={label} className="bg-white border rounded-2xl p-5"><p className="text-sm text-slate-500">{label}</p><p className="text-lg font-semibold mt-2">{value}</p></div>)}
    </div>
    <div className="bg-white border rounded-2xl p-6 mt-5">
      <h2 className="font-semibold text-lg">Skills</h2>
      <div className="flex flex-wrap gap-2 mt-3">{(record.skills || []).length ? record.skills.map(skill => <span key={skill} className="bg-slate-100 rounded-full px-3 py-1 text-sm">{skill}</span>) : <p className="text-slate-500">No skills recorded.</p>}</div>
      {record.achievements?.length > 0 && <><h2 className="font-semibold text-lg mt-6">Achievements</h2><ul className="list-disc pl-5 mt-2 text-slate-600">{record.achievements.map((item, i) => <li key={i}>{typeof item === "string" ? item : item.title || item.name || JSON.stringify(item)}</li>)}</ul></>}
      {record.transcript?.url && <a className="inline-block mt-6 text-blue-600 font-medium" href={record.transcript.url} target="_blank" rel="noreferrer">View Transcript</a>}
    </div>
  </section>;
}
