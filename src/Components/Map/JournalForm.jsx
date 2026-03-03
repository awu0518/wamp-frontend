import { useState } from 'react';
import { createJournal } from '../../services/api';

export default function JournalForm({ city, stateCode, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createJournal({
        title: title.trim(),
        body: body.trim(),
        location_type: 'city',
        location_name: city,
        state_code: stateCode,
        iso_code: 'US',
        ...(visitedAt && { visited_at: visitedAt }),
      });
      onSuccess();
    } catch (err) {
      setError(err.data?.error || err.message || 'Failed to create journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h5 className="text-sm font-semibold text-ocean-900">New Journal Entry</h5>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. Weekend in the city"
          className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-white text-sm text-neutral-800 placeholder-sand-300 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Date visited</label>
        <input
          type="date"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Notes</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="What did you do there?"
          className="w-full px-3 py-2 rounded-lg border border-sand-200 bg-white text-sm text-neutral-800 placeholder-sand-300 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors resize-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-2.5">
          <span className="text-coral-600 text-xs leading-none mt-0.5">✕</span>
          <p className="text-xs text-coral-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 bg-ocean-600 hover:bg-ocean-800 text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-sand-200 text-sm text-neutral-600 hover:bg-sand-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
