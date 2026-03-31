import { useState, useEffect, useMemo } from 'react';
import { getJournals, deleteJournal } from '../../services/api';
import JournalForm from './JournalForm';
import { journalMatchesDateRange, hasJournalDateFilter } from './journalDateFilter';

export default function JournalPanel({
  city,
  stateCode,
  dateFrom = '',
  dateTo = '',
  onClose,
  onJournalAdded,
}) {
  const [result, setResult] = useState({ journals: null, error: null });
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editingJournal, setEditingJournal] = useState(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const loading = isLoggedIn && result.journals === null && !result.error;

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    getJournals({ location_type: 'city' })
      .then((data) => {
        if (cancelled) return;
        const items = (data.journals || []).filter(
          (j) => j.location_name === city && j.state_code === stateCode,
        );
        setResult({ journals: items, error: null, authError: false });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          localStorage.removeItem('token');
          setResult({ journals: [], error: null, authError: true });
        } else {
          setResult({ journals: [], error: err.message, authError: false });
        }
      });

    return () => { cancelled = true; };
  }, [city, stateCode, isLoggedIn, refreshKey]);

  const allForCity = result.journals || [];
  const journals = useMemo(
    () => allForCity.filter((j) => journalMatchesDateRange(j, dateFrom, dateTo)),
    [allForCity, dateFrom, dateTo],
  );
  const dateFilterActive = hasJournalDateFilter(dateFrom, dateTo);
  const error = result.error;
  const showLoginPrompt = !isLoggedIn || result.authError;

  const handleCreated = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
    if (onJournalAdded) onJournalAdded();
  };

  const handleEdited = () => {
    setEditingJournal(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteJournal(id);
      setResult((prev) => ({
        ...prev,
        journals: (prev.journals || []).filter((j) => j._id !== id),
      }));
      if (onJournalAdded) onJournalAdded();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete journal');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-80 border-l border-sand-200 bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-sand-200 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs bg-ocean-100 text-ocean-700 px-2.5 py-1 rounded-full font-medium">
              Journals
            </span>
            <h3 className="text-lg font-bold mt-2 text-ocean-900">{city}</h3>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">{stateCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors text-lg leading-none shrink-0 mt-1"
            aria-label="Close journal panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: 0 }}>
        {showLoginPrompt && (
          <div className="flex items-start gap-2 bg-sand-100 border border-sand-200 rounded-lg p-3">
            <span className="text-sand-500 text-sm leading-none mt-0.5">ℹ</span>
            <p className="text-xs text-sand-500">Log in to see and add journal entries.</p>
          </div>
        )}

        {!showLoginPrompt && loading && (
          <div className="flex items-center gap-2 text-sm text-ocean-600">
            <div className="w-3 h-3 rounded-full border-2 border-ocean-400 border-t-transparent animate-spin" />
            Loading journals…
          </div>
        )}

        {!showLoginPrompt && error && (
          <div className="flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3">
            <span className="text-coral-600 text-sm leading-none mt-0.5">✕</span>
            <p className="text-xs text-coral-600">{error}</p>
          </div>
        )}

        {deleteError && (
          <div className="flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3 mb-3">
            <span className="text-coral-600 text-sm leading-none mt-0.5">✕</span>
            <p className="text-xs text-coral-600">{deleteError}</p>
          </div>
        )}

        {!showLoginPrompt && !loading && !error && journals.length === 0 && !showForm && (
          <div className="flex items-start gap-2 bg-sand-100 border border-sand-200 rounded-lg p-3">
            <span className="text-sand-500 text-sm leading-none mt-0.5">ℹ</span>
            <p className="text-xs text-sand-500">
              {dateFilterActive && allForCity.length > 0
                ? `No journal entries for ${city} in this visit date range.`
                : `No journal entries for ${city} yet.`}
            </p>
          </div>
        )}

        {/* Journal entries */}
        {!showLoginPrompt && !loading && journals.length > 0 && (
          <ul className="space-y-3 mb-4">
            {journals.map((j) => (
              <li
                key={j._id}
                className="bg-sand-50 border border-sand-200 rounded-lg p-3"
              >
                {editingJournal?._id === j._id ? (
                  <JournalForm
                    city={city}
                    stateCode={stateCode}
                    journal={j}
                    onSuccess={handleEdited}
                    onCancel={() => setEditingJournal(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-semibold text-neutral-800 flex-1 min-w-0">
                        {j.title}
                      </h5>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => { setEditingJournal(j); setShowForm(false); }}
                          disabled={!!deletingId}
                          aria-label={`Edit journal ${j.title}`}
                          className="text-neutral-300 hover:text-ocean-500 transition-colors text-sm leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(j._id)}
                          disabled={deletingId === j._id}
                          aria-label={`Delete journal ${j.title}`}
                          className="text-neutral-300 hover:text-coral-500 transition-colors text-sm leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {deletingId === j._id ? '…' : '✕'}
                        </button>
                      </div>
                    </div>
                    {j.visited_at && (
                      <p className="text-xs text-neutral-400 mt-0.5">{j.visited_at}</p>
                    )}
                    {j.body && (
                      <p className="text-xs text-neutral-600 mt-1.5 line-clamp-3">{j.body}</p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Add form (inline) */}
        {!showLoginPrompt && showForm && (
          <JournalForm
            city={city}
            stateCode={stateCode}
            onSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {/* Footer action */}
      {!showLoginPrompt && !showForm && !editingJournal && (
        <div className="p-4 border-t border-sand-200 shrink-0">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full bg-ocean-600 hover:bg-ocean-800 text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-sm"
          >
            + Add Journal
          </button>
        </div>
      )}
    </div>
  );
}
