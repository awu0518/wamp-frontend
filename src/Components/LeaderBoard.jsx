import { useCallback, useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import { Link } from "react-router-dom";

export default function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLeaderboard();
      setLeaders(Array.isArray(data.rankings) ? data.rankings : []);
      setPopularDestinations(
        Array.isArray(data.popularDestinations) ? data.popularDestinations : []
      );
    } catch (err) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1eb] flex items-center justify-center px-6">
        <p className="text-[#295c3b] text-lg font-serif">Loading leaderboard…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f1eb] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => loadLeaderboard()}
            className="px-4 py-2 rounded-lg bg-[#295c3b] text-white hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb]">
      {/* top banner */}
      <section className="bg-[#dfe8ee] py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#295c3b] mb-4 font-serif">
            Leaderboard
          </h1>
          <p className="text-[#a67c52] text-xl max-w-3xl mx-auto leading-relaxed">
            See how your travels compare with others. The leaderboard ranks
            users by number of places visited and highlights the most active
            travelers.
          </p>
        </div>
      </section>

      {/* scrolling leaderboard cards */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c7] p-6">
          <h2 className="text-3xl font-bold text-[#295c3b] text-center mb-3 font-serif">
            Top Travelers
          </h2>
          <p className="text-center text-[#a67c52] mb-8 text-lg">
            Scroll to explore the current top 100 rankings. 
          </p>

          <div className="max-h-[500px] overflow-y-auto pr-2">
            <div className="flex flex-col gap-6">
                {leaders.slice(0,100).map((user, index) => (
                <div
                    key={user.user_id}
                    className="bg-[#faf8f5] border border-[#e5d8c7] rounded-2xl shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#3d8756] text-white flex items-center justify-center text-xl font-bold">
                        {index + 1}
                    </div>
                    <span className="text-base font-semibold text-[#a67c52]">
                        Rank #{index + 1}
                    </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#295c3b] font-serif mb-2">
                    {user.username}
                    </h3>

                    <p className="text-[#8b6b4a] text-base mb-4">
                    Places visited
                    </p>

                    <div className="text-4xl font-bold text-[#2f7db2]">
                    {user.placesVisited}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
      </section>

      {popularDestinations.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c7] p-6">
            <h2 className="text-2xl font-bold text-[#295c3b] text-center mb-6 font-serif">
              Top 6 Popular Destinations
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularDestinations.slice(0, 6).map((d) => (
                <li
                  key={d.name}
                  className="flex justify-between items-center rounded-xl border border-[#e5d8c7] bg-[#faf8f5] px-4 py-3 text-[#295c3b]"
                >
                  <Link
                    to={`/map?city=${encodeURIComponent(d.name)}`}
                    className="font-medium truncate pr-2 hover:underline"
                  >
                    {d.name || "—"}
                  </Link>
                  <span className="text-[#2f7db2] font-semibold shrink-0">
                    {d.count} visits
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}