import { useEffect, useState } from 'react';
import { subjectApi, awardsApi, type Subject, type Award } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { BarChart2, Clock, BookOpen, Trophy, Flame, TrendingUp } from 'lucide-react';

// Simple bar chart using divs
function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{d.label}</span>
            <span className="font-medium">{d.value}</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                 style={{ width: `${Math.min((d.value / d.max) * 100, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Activity heatmap (last 7 days)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ACTIVITY = [3, 5, 2, 7, 4, 1, 6]; // demo minutes per day

export default function Analytics() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Subject[]>([]);
  const [awards, setAwards]   = useState<Award[]>([]);

  useEffect(() => {
    subjectApi.list().then((r) => setCourses(r.data.data ?? [])).catch(() => {});
    awardsApi.list().then((r) => setAwards(r.data.data ?? [])).catch(() => {});
  }, []);

  const enrolled = courses.filter((c) => c.enrolled);
  const totalVideos = courses.reduce((n, c) => n + (c.video_count ?? 0), 0);

  const courseProgress = enrolled.map((c) => ({
    label: c.title,
    value: 0, // would come from progress API
    max: c.video_count ?? 1,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
          <BarChart2 size={22} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Progress</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track your learning activity</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Enrolled',     value: enrolled.length,  icon: BookOpen,   bg: 'bg-indigo-50 dark:bg-indigo-900/30',  color: 'text-indigo-600' },
          { label: 'Certificates', value: awards.length,    icon: Trophy,     bg: 'bg-amber-50 dark:bg-amber-900/30',    color: 'text-amber-600'  },
          { label: 'Day Streak',   value: 3,                icon: Flame,      bg: 'bg-orange-50 dark:bg-orange-900/30',  color: 'text-orange-500' },
          { label: 'Total Videos', value: totalVideos,      icon: TrendingUp, bg: 'bg-emerald-50 dark:bg-emerald-900/30',color: 'text-emerald-600'},
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                                      rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 ${bg} rounded-xl flex-shrink-0`}>
              <Icon className={color} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly activity */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-slate-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Weekly Activity</h2>
          </div>
          <div className="flex items-end gap-2 h-28">
            {DAYS.map((day, i) => {
              const h = Math.max((ACTIVITY[i] / 7) * 100, 8);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-indigo-500 dark:bg-indigo-600 transition-all"
                       style={{ height: `${h}%` }} />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{day}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">Lessons completed per day</p>
        </div>

        {/* Course progress */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-slate-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Course Progress</h2>
          </div>
          {courseProgress.length > 0 ? (
            <BarChart data={courseProgress} />
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Enroll in courses to track progress</p>
            </div>
          )}
        </div>

        {/* Streak calendar */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Learning Streak</h2>
            <span className="ml-auto text-sm font-bold text-orange-500">3 🔥 days</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 35 }).map((_, i) => {
              const active = [28, 29, 30, 31, 32].includes(i);
              const recent = [33, 34].includes(i);
              return (
                <div key={i}
                  className={`w-7 h-7 rounded-md transition
                    ${active  ? 'bg-orange-400 dark:bg-orange-500' :
                      recent  ? 'bg-indigo-400 dark:bg-indigo-500' :
                                'bg-slate-100 dark:bg-slate-700'}`} />
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Streak day</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-400 inline-block" /> Active day</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-700 inline-block" /> Inactive</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
        Hello {user?.name?.split(' ')[0]} — keep learning to unlock more stats and achievements!
      </p>
    </div>
  );
}
