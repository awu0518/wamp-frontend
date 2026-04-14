import { useEffect, useMemo, useState } from "react";
import { getJournals, deleteJournal, updateJournal } from "../services/api"; 
import { Link } from "react-router-dom";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editVisitDate, setEditVisitDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);   

  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc"); // date_desc, date_asc

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJournals();
      const journals = data.journals ?? [];
      setItems(journals);
    } catch (e) {
      setError(e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = items;

    if (needle) {
      out = out.filter((j) => {
        const text = [
          j.title,
          j.notes,
          j.location_name,
          j.country,
          j.state,
          j.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(needle);
      });
    }

    out = [...out].sort((a, b) => {
      const da = new Date(a.visited_at ?? a.visit_date ?? a.date ?? a.created_at ?? 0).getTime();
      const db = new Date(b.visited_at ?? b.visit_date ?? b.date ?? b.created_at ?? 0).getTime();
      return sort === "date_asc" ? da - db : db - da;
    });

    return out;
  }, [items, q, sort]);

  async function onDelete(entry) {
    const journalId = entry._id ?? entry.id;
    if (!journalId || !confirm("Delete this entry?")) return;
    try {
      const deleteTarget = entry.links?.delete ?? journalId;
      await deleteJournal(deleteTarget);
      setItems((prev) => prev.filter((x) => (x._id ?? x.id) !== journalId));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  function startEdit(j) {
    const id = j._id ?? j.id;
    setEditingId(id);
    setEditTitle(j.title ?? "");
    setEditNotes(j.body ?? "");
    setEditVisitDate((j.visited_at ?? "").slice(0, 10));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditNotes("");
    setEditVisitDate("");
  }

  async function saveEdit(id) {
    setSavingEdit(true);
    try {
      const payload = {
        title: editTitle.trim() || undefined,
        body: editNotes.trim(),
        visited_at: editVisitDate || undefined,
      };

      // HATEOAS 
      const journal = items.find((x) => (x._id ?? x.id) === id);
      const updateTarget = journal?.links?.update ?? id;
      await updateJournal(updateTarget, payload);

      await load();
      setEditingId(null);

      cancelEdit();
    } catch (e) {
      alert(e.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return <div className="w-full max-w-3xl mx-auto p-6">Loading…</div>;
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-3 px-4 py-2 rounded-lg bg-ocean-600 text-white"
          onClick={load}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
  <div className="w-full max-w-3xl mx-auto p-6">
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Personal History</h1>

        <Link
          to="/map"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ocean-600 hover:bg-ocean-800 text-white text-xl font-bold"
          title="Add from map"
        >
          +
        </Link>
      </div>
        <div className="flex gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes, location…"
            className="px-3 py-2 rounded-lg border border-sand-200"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-sand-200 bg-white"
          >
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-sand-200 p-6 bg-white">
          <p className="text-neutral-700">No entries yet.</p>
          <p className="text-sm text-neutral-500 mt-1">
            Add a location on the Map page and write a journal entry.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((j) => {
            const id = j._id ?? j.id;
            const when = j.visited_at ?? j.visit_date ?? j.date ?? j.created_at;
            const title = j.title ?? j.location_name ?? "Journal Entry";
            const loc = [j.location_name, j.state_code, j.iso_code].filter(Boolean).join(", ");

            return (
              <div
                key={id}
                className="rounded-xl border border-sand-200 p-5 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <div className="text-sm text-neutral-500 mt-1">
                      {when ? new Date(when).toLocaleString() : "—"}
                      {loc ? ` • ${loc}` : ""}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingId === id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(id)}
                          disabled={savingEdit || !editNotes.trim()}
                          className="text-sm px-3 py-2 rounded-lg bg-ocean-600 hover:bg-ocean-800 text-white disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-sm px-3 py-2 rounded-lg border border-sand-200 text-neutral-700 hover:bg-sand-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(j)}
                          className="text-sm px-3 py-2 rounded-lg border border-sand-200 text-neutral-700 hover:bg-sand-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(j)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === id ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-800 mb-1">
                        Title
                      </label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-sand-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-800 mb-1">
                        Visit date
                      </label>
                      <input
                        type="date"
                        value={editVisitDate}
                        onChange={(e) => setEditVisitDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-sand-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-800 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-sand-200"
                      />
                    </div>
                  </div>
                ) : (
                  (j.body ?? j.notes) && (
                    <p className="mt-3 text-neutral-800 whitespace-pre-wrap">
                      {j.body ?? j.notes}
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
