import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, awardsApi, type Award, type EnrolledCourse } from '@/api';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/Spinner';
import { BookOpen, TrendingUp, Award as AwardIcon, ArrowRight, Play, Trophy, Clock } from 'lucide-react';

const COLORS = [
  'from-indigo-500 to-indigo-600', 'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600', 'from-orange-500 to-orange-600',
  'from-rose-500 to-rose-600',
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  const [stats, setStats]   = useState({ totalCourses: 0, enrolledCourses: 0, certificates: 0 });
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);
  const [awards, setAwards]     = useState<Award[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      authApi.dashboard().then((r) => {
        const d = r.data.data;
        setStats({ totalCourses: d.totalCourses, enrolledCourses: d.enrolledCourses, certificates: d.certificates });
        setEnrolled(d.enrolled ?? []);
      }),
      awardsApi.list().then((r) => setAwards(r.data.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-7 mb-8 text-white overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-4 right-24 w-20 h-20 bg-white rounded-full" />
        </div>
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium mb-1">Good day,</p>
          <h1 className="text-3xl font-bold mb-2">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-indigo-200 text-sm mb-5">
            {enrolled.length > 0
              ? `You're enrolled in ${enrolled.length} course${enrolled.length > 1 ? 's' : ''}. Keep going!`
              : 'Start your learning journey today.'}
          </p>
          <button onClick={() => navigate('/courses')}
            className="flex items-center gap-2 bg-white text-indigo-700 font-semibold
                       text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition w-fit shadow-sm">
            Browse Courses <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Courses',  value: stats.totalCourses,    icon: BookOpen,   bg: 'bg-indigo-50',  color: 'text-indigo-600' },
          { label: 'Enrolled',       value: stats.enrolledCourses, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Certificates',   value: stats.certificates,    icon: Trophy,     bg: 'bg-amber-50',   color: 'text-amber-600' },
          { label: 'In Progress',    value: enrolled.filter(c => c.completed_videos > 0 && c.completed_videos < c.total_videos).length,
            icon: Clock, bg: 'bg-violet-50', color: 'text-violet-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 ${bg} rounded-xl flex-shrink-0`}><Icon className={color} size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled courses with real progress */}
      {enrolled.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Continue Learning</h2>
            <button onClick={() => navigate('/courses')}
              className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolled.slice(0, 6).map((c, i) => {
              const pct = c.total_videos > 0 ? Math.round((c.completed_videos / c.total_videos) * 100) : 0;
              return (
                <div key={c.id} onClick={() => navigate(`/courses/${c.id}`)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm
                             hover:shadow-md cursor-pointer transition group">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50
                                       border border-emerald-200 px-2.5 py-1 rounded-full">Enrolled</span>
                      <span className="text-xs text-slate-400">{c.total_videos} videos</span>
                    </div>
                    <h3 className="text-slate-800 font-semibold text-sm mb-1 group-hover:text-indigo-600 transition line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{c.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${COLORS[i % COLORS.length]} rounded-full transition-all`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
                      <Play size={12} /> {pct > 0 ? 'Continue Learning' : 'Start Learning'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Your Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map((a) => (
              <div key={a.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200
                           rounded-xl p-5 shadow-sm flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0">
                  <AwardIcon className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{a.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{a.subject_title}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(a.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrolled.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 mb-4">You haven't enrolled in any courses yet.</p>
          <button onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
}
