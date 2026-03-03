export default function StateSidebar({
  selectedState,
  cities,
  citiesLoading,
  citiesError,
  journalCounts,
  onClose,
  onCityClick,
}) {
  return (
    <div className="w-72 border-l border-sand-200 bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-sand-200 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs bg-forest-100 text-forest-800 px-2.5 py-1 rounded-full font-medium">
              State
            </span>
            <h3 className="text-xl font-bold mt-2 text-ocean-900">
              {selectedState.name}
            </h3>
            {selectedState.capital && (
              <p className="text-sm text-neutral-500 mt-0.5">
                Capital: {selectedState.capital}
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              {selectedState.code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors text-lg leading-none shrink-0 mt-1"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* City list */}
      <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: 0 }}>
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">
          Cities in database
          {!citiesLoading && (
            <span className="ml-1.5 text-xs bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full font-medium">
              {cities.length}
            </span>
          )}
        </h4>

        {citiesLoading && (
          <div className="flex items-center gap-2 text-sm text-ocean-600">
            <div className="w-3 h-3 rounded-full border-2 border-ocean-400 border-t-transparent animate-spin" />
            Loading…
          </div>
        )}

        {citiesError && (
          <div className="flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3">
            <span className="text-coral-600 text-sm leading-none mt-0.5">✕</span>
            <p className="text-xs text-coral-600">{citiesError}</p>
          </div>
        )}

        {!citiesLoading && !citiesError && cities.length === 0 && (
          <div className="flex items-start gap-2 bg-sand-100 border border-sand-200 rounded-lg p-3">
            <span className="text-sand-500 text-sm leading-none mt-0.5">ℹ</span>
            <p className="text-xs text-sand-500">
              No cities found for {selectedState.name}.
            </p>
          </div>
        )}

        {!citiesLoading && cities.length > 0 && (
          <ul className="space-y-1.5">
            {cities.map((city) => {
              const count = journalCounts[city] || 0;
              return (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => onCityClick(city)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sand-50 border border-sand-200 hover:bg-ocean-50 hover:border-ocean-200 transition-colors text-left"
                  >
                    <span className="text-xs bg-sand-100 text-earth-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                      City
                    </span>
                    <span className="text-sm text-neutral-800 truncate flex-1">{city}</span>
                    {count > 0 && (
                      <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
