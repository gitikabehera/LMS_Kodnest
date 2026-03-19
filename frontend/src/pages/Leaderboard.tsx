import { Trophy, Medal, Crown } from 'lucide-react';

// Static demo data — replace with API when backend is ready
const GLOBAL = [
  { rank: 1, name: 'Alice Johnson',  points: 4850, courses: 5, streak: 21 },
  { rank: 2, name: 'Bob Martinez',   points: 4200, courses: 4, streak: 14 },
  { rank: 3, name: 'Carol Singh',    points: 3900, courses: 4, streak: 10 },
  { rank: 4, name: 'David Kim',      points: 3400, courses: 3, streak: 7  },
  { rank: 5, name: 'Eva Patel',      points: 2950, courses: 3, streak: 5  },
  { rank: 6, name: 'Frank Osei',     points: 2600, courses: 2, streak: 3  },
  { rank: 7, name: 'Grace Liu',      points: 2100, courses: 2, streak: 2  },
  { rank: 8, name: 'Henry Brown',    points: 1800, courses: 1, streak: 1  },
];

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
  2: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-600',
  3: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={18} className="text-amber-500" />;
  if (rank === 2) return <Medal size={18} className="text-slate-400" />;
  if (rank === 3) return <Medal size={18} className="text-orange-400" />;
  return <span className="text-slate-400 dark:text-slate-500 font-bold text-sm w-[18px] text-center">{rank}</span>;
}

export default function Leaderboard() {
  const top3 = GLOBAL.slice(0, 3);
  const rest  = GLOBAL.slice(3);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
          <Trophy size={22} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Leaderboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Top learners this month</p>
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[top3[1], top3[0], top3[2]].map((u, idx) => {
          if (!u) return null;
          const heights = ['h-24', 'h-32', 'h-20'];
          const colors  = ['bg-slate-200 dark:bg-slate-600', 'bg-amber-400', 'bg-orange-300 dark:bg-orange-500'];
          return (
            <div key={u.rank} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center
                              text-white font-bold text-lg shadow-md">
                {u.name[0]}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center truncate w-full px-1">{u.name.split(' ')[0]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{u.points.toLocaleString()} pts</p>
              <div className={`w-full ${heights[idx]} ${colors[idx]} rounded-t-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">#{u.rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700
                        text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="col-span-1">Rank</span>
          <span className="col-span-5">Learner</span>
          <span className="col-span-2 text-right">Points</span>
          <span className="col-span-2 text-right">Courses</span>
          <span className="col-span-2 text-right">Streak</span>
        </div>
        {GLOBAL.map((u) => (
          <div key={u.rank}
            className={`grid grid-cols-12 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700
                        last:border-0 items-center ${RANK_STYLES[u.rank] ?? ''}`}>
            <div className="col-span-1 flex items-center justify-center">
              <RankIcon rank={u.rank} />
            </div>
            <div className="col-span-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center
                              text-white text-xs font-bold flex-shrink-0">
                {u.name[0]}
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{u.points.toLocaleString()}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm text-slate-600 dark:text-slate-400">{u.courses}</span>
            </div>
            <div className="col-span-2 text-right flex items-center justify-end gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">{u.streak}</span>
              <span className="text-orange-500">🔥</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
        Live rankings update as you complete lessons and earn points.
      </p>
    </div>
  );
}
