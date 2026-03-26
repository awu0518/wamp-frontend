import { useEffect, useState } from "react";

export default function LeaderBoard() {
  const [leaders, setLeaders] = useState([
    { id: 1, username: "Alex", placesVisited: 18 },
    { id: 2, username: "Mingjian", placesVisited: 15 },
    { id: 3, username: "Wendy", placesVisited: 12 },
    { id: 4, username: "Sophia", placesVisited: 10 },
    { id: 5, username: "Daniel", placesVisited: 9 },
    { id: 6, username: "Emma", placesVisited: 8 },
  ]);


  useEffect(() => {

  }, []);

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
            Scroll to explore the current rankings.
          </p>

          <div className="max-h-[500px] overflow-y-auto pr-2">
            <div className="flex flex-col gap-6">
                {leaders.map((user, index) => (
                <div
                    key={user.id}
                    className="bg-[#faf8f5] border border-[#e5d8c7] rounded-2xl shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#3d8756] text-white flex items-center justify-center text-xl font-bold">
                        {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-[#a67c52]">
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
    </main>
  );
}