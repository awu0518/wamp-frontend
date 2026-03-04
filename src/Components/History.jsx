import { useEffect, useMemo, useState } from "react";
import { getJournals, deleteJournal } from "../services/api"; // adjust path if needed

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc"); // date_desc, date_asc

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // If your backend supports query params, pass them here
      const data = await getJournals();
      // data might be { journals: [...] } or [...]
      const journals = Array.isArray(data) ? data : (data.journals ?? data.items ?? []);
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
      const da = new Date(a.visit_date ?? a.date ?? a.created_at ?? 0).getTime();
      const db = new Date(b.visit_date ?? b.date ?? b.created_at ?? 0).getTime();
      return sort === "date_asc" ? da - db : db - da;
    });

    return out;
  }, [items, q, sort]);

  async function onDelete(journalId) {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteJournal(journalId);
      setItems((prev) => prev.filter((x) => (x._id ?? x.id) !== journalId));
    } catch (e) {
      alert(e.message || "Delete failed");
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
        <h1 className="text-2xl font-bold">Personal History</h1>

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
            const when = j.visit_date ?? j.date ?? j.created_at;
            const title = j.title ?? j.location_name ?? "Journal Entry";
            const loc = [j.city, j.state, j.country].filter(Boolean).join(", ");

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

                  <button
                    onClick={() => onDelete(id)}
                    className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                {j.notes && (
                  <p className="mt-3 text-neutral-800 whitespace-pre-wrap">
                    {j.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
