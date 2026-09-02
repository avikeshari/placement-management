import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function TalentSearch() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const search = async (preserve) => {
    setLoading(true);
    setError("");
    setRows([]);
    try {
      const r = await api.get("/candidate-search", { params: { q } });
      setRows(r.data.students || []);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to search talent"));
    } finally {
      setLoading(false);
      void preserve;
    }
  };

  useEffect(() => { search(); /* eslint-disable-next-line */ }, []);

  const saveCandidate = async (id) => {
    if (savingId === id) return;
    try {
      setSavingId(id);
      await api.post(`/saved-candidates/${id}`);
      toast.success("Candidate saved");
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to save candidate"));
    } finally {
      setSavingId(null);
    }
  };

  const openNote = (student) => { setNote(""); setNoteFor(student); };
  const closeNote = () => { setNoteFor(null); setNote(""); };

  const submitNote = async () => {
    if (!note.trim()) { toast.error("Note cannot be empty"); return; }
    setSavingNote(true);
    try {
      await api.post(`/candidate-search/${noteFor._id}/notes`, { note });
      toast.success("Note saved");
      closeNote();
    } catch (e) {
      toast.error(getErrorMessage(e, "Unable to save note"));
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Talent Search</h1>
      <div className="flex gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Skills, branch or job interest"
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button onClick={() => search()} className="bg-blue-600 text-white rounded-lg px-5">Search</button>
      </div>

      {loading ? (
        <Loader text="Searching candidates..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => search()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No candidates found"
          message="Try a different search term such as a skill (React, Java) or branch (CSE, ECE)."
        />
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{rows.length} result{rows.length === 1 ? "" : "s"}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {rows.map((s) => (
              <div className="bg-white border rounded-2xl p-5" key={s._id}>
                <h2 className="font-semibold">{s.name}</h2>
                <p className="text-slate-500">{s.email}</p>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => saveCandidate(s._id)} disabled={savingId === s._id} className="text-blue-600 text-sm disabled:text-slate-400">{savingId === s._id ? "Saving..." : "+ Save candidate"}</button>
                  <button onClick={() => openNote(s)} className="text-slate-600 text-sm">+ Add private note</button>
                </div>
                <p className="mt-2">{s.profile?.branch || "Branch not provided"} · {s.profile?.graduationYear || "—"}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(s.profile?.skills || []).map((x) => (
                    <span className="text-xs bg-slate-100 rounded-full px-2 py-1" key={x}>{x}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {noteFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={closeNote}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Add a private note for {noteFor.name}</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Only you can see this note..."
              className="border rounded-lg p-3 w-full mt-4"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeNote} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button onClick={submitNote} disabled={savingNote} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                {savingNote ? "Saving..." : "Save note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
