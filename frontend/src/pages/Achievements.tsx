import { Flame, Star, Zap, BookOpen, Trophy, Target, Clock, CheckCircle } from 'lucide-react';

interface Achievement {
  id: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-enroll',  icon: BookOpen,    color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30',  title: 'First Step',        desc: 'Enroll in your first course',              unlocked: true  },
  { id: 'streak-7',      icon: Flame,       color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30',  title: '7-Day Streak',      desc: 'Learn 7 days in a row',                    unlocked: false, progress: 3, total: 7  },
  { id: 'streak-30',     icon: Flame,       color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/30',        title: '30-Day Streak',     desc: 'Learn 30 days in a row',                   unlocked: false, progress: 3, total: 30 },
  { id: 'first-video',   icon: CheckCircle, color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/30',title: 'First Lesson',      desc: 'Complete your first video lesson',          unlocked: true  },
  { id: '5-videos',      icon: Star,        color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/30',    title: 'Quick Learner',     desc: 'Complete 5 video lessons',                 unlocked: false, progress: 1, total: 5  },
  { id: 'first-quiz',    icon: Target,      color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30',  title: 'Quiz Taker',        desc: 'Complete your first quiz',                 unlocked: false },
  { id: 'perfect-quiz',  icon: Zap,         color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30',  title: 'Perfect Score',     desc: 'Score 100% on any quiz',                   unlocked: false },
  { id: 'first-cert',    icon: Trophy,      color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/30',    title: 'Certified',         desc: 'Earn your first certificate',              unlocked: false },
  { id: 'all-courses',   icon: BookOpen,    color: 'text-indigo-700', bg: 'bg-indigo-50 dark:bg-indigo-900/30',  title: 'Course Master',     desc: 'Enroll in all available courses',          unlocked: false, progress: 1, total: 5  },
  { id: 'time-10h',      icon: Clock,       color: 'text-slate-600',  bg: 'bg-slate-100 dark:bg-slate-700',      title: '10 Hours Learned',  desc: 'Spend 10 hours watching lessons',          unlocked: false, progress: 2, total: 10 },
  { id: 'top-3',         icon: Trophy,      color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/30',    title: 'Top 3',             desc: 'Reach top 3 on the leaderboard',           unlocked: false },
  { id: 'night-owl',     icon: Star,        color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/30',  title: 'Night Owl',         desc: 'Complete a lesson after 10 PM',            unlocked: false },
];

export default function Achievements() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Achievements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {unlocked} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700
                        rounded-xl px-4 py-2 text-center">
          <p className="text-2xl font-bold text-amber-600">{unlocked}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">Earned</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                      rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
          <span className="text-slate-500 dark:text-slate-400">{Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
               style={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id}
              className={`relative border rounded-xl p-4 transition
                ${a.unlocked
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'}`}>
              {a.unlocked && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full
                                flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
              <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={a.color} />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 mb-2">{a.desc}</p>
              {!a.unlocked && a.progress != null && a.total != null && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{a.progress}/{a.total}</span>
                    <span>{Math.round((a.progress / a.total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full"
                         style={{ width: `${(a.progress / a.total) * 100}%` }} />
                  </div>
                </div>
              )}
              {a.unlocked && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
