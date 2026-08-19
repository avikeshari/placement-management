import { useCallback, useEffect, useState } from "react";
import { Search, UserX, UserCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/students");
      setStudents(response.data.students || []);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load students."));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (student) => {
    try {
      const response = await api.patch(`/admin/users/${student._id}/status`, { isActive: !student.isActive });
      setStudents((items) => items.map((item) => item._id === student._id ? { ...item, isActive: response.data.user.isActive } : item));
      toast.success(response.data.message);
    } catch (error) { toast.error(getErrorMessage(error, "Unable to update account status.")); }
  };

  const remove = async (student) => {
    if (!window.confirm(`Delete ${student.name}'s account? This will remove their profile, applications and interviews.`)) return;
    try {
      await api.delete(`/admin/users/${student._id}`);
      setStudents((items) => items.filter((item) => item._id !== student._id));
      toast.success("Student deleted successfully");
    } catch (error) { toast.error(getErrorMessage(error, "Unable to delete student.")); }
  };

  if (loading) return <Loader text="Loading students..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = students.filter((student) => {
    const text = `${student.name} ${student.email} ${student.profile?.college || ""} ${student.profile?.branch || ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div><h1 className="text-2xl md:text-3xl font-bold">Students</h1><p className="text-slate-500 mt-2">Manage student accounts and placement activity.</p></div>
        <div className="relative w-full md:w-80"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" className="w-full border rounded-lg pl-10 pr-3 py-2.5 bg-white" /></div>
      </div>
      {!filtered.length ? <EmptyState title="No students found" message="Try a different search." /> : (
        <div className="bg-white border rounded-2xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50"><tr>{["Student","Academic","Applications","Status","Actions"].map((h) => <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((student) => <tr key={student._id} className="border-t">
                <td className="px-5 py-4"><p className="font-semibold">{student.name}</p><p className="text-slate-500">{student.email}</p></td>
                <td className="px-5 py-4"><p>{student.profile?.branch || "—"}</p><p className="text-slate-500">CGPA: {student.profile?.cgpa ?? "—"}</p></td>
                <td className="px-5 py-4">{student.applications} <span className="text-slate-400">({student.selected} selected)</span></td>
                <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs ${student.isActive === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{student.isActive === false ? "Inactive" : "Active"}</span></td>
                <td className="px-5 py-4"><div className="flex gap-3"><button onClick={() => toggleStatus(student)} className="text-blue-600 inline-flex items-center gap-1">{student.isActive === false ? <UserCheck size={15} /> : <UserX size={15} />}{student.isActive === false ? "Activate" : "Deactivate"}</button><button onClick={() => remove(student)} className="text-red-600 inline-flex items-center gap-1"><Trash2 size={15} />Delete</button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
export default Students;
