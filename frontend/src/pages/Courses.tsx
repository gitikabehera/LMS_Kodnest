import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectApi, enrollApi, type Subject } from '@/api';
import Spinner from '@/components/Spinner';
import { Search, BookOpen, CheckCircle, Play, Users, Video, ClipboardList, GraduationCap, Star } from 'lucide-react';

const ACCENTS = [
  { bar: 'bg-indigo-500',  icon: 'bg-indigo-50 text-indigo-600'  },
  { bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600' },
  { bar: 'bg-violet-500',  icon: 'bg-violet-50 text-violet-600'   },
  { bar: 'bg-orange-500',  icon: 'bg-orange-50 text-orange-600'   },
  { bar: 'bg-rose-500',    icon: 'bg-rose-50 text-rose-600'       },
];

const CATEGORIES = ['All', 'Web Dev', 'Python', 'Data Science', 'Cybersecurity', 'Cloud'];
const CATEGORY_MAP: Record<string, string> = {
  'Web Dev': 'web', 'Python': 'python', 'Data Science': 'data',
  'Cybersecurity': 'cyber', 'Cloud': 'cloud',
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses]     = useState<Subject[]>([]);
  const [filtered, setFiltered]   = useState<Subject[]>([]);
  const [query, setQuery]         = useState('');
  const [category, setCategory]   = useState('All');
  const [loading, setLoading]     = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [toast, setToast]         = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 4000); }

  useEffect(() => {
    subjectApi.list()
      .then((r) => { const d = r.data.data ?? []; setCourses(d); setFiltered(d); })
      .catch((err) => showToast(err?.response?.data?.message || 'Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const kw = category !== 'All' ? CATEGORY_MAP[category] : '';
    setFiltered(courses.filter((c) => {
      const matchQ = c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
      const matchC = !kw || c.title.toLowerCase().includes(kw) || (c.description ?? '').toLowerCase().includes(kw);
      return matchQ && matchC;
    }));
  }, [query, category, courses]);

  async function handleEnroll(e: React.MouseEvent, courseId: number) {
    e.stopPropagation();
    setEnrolling(courseId);
    try {
      await enrollApi.enroll(courseId);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c)));
      navigate(`/courses/${courseId}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Enrollment failed.';
      if (status === 401) { showToast('Session expired.'); navigate('/login'); } else showToast(msg);
    } finally { setEnrolling(null); }
  }

  const enrolledCount = courses.filter((c) => c.enrolled).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <div className="fixed top-20 right-4 z-50 bg-red-600 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #4f46e5 100%)' }}>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-4"><GraduationCap size={20} className="text-blue-300" /><span className="text-blue-200 text-sm font-medium">LearnHub Academy</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Explore Our Course Catalog</h1>
          <p className="text-blue-200 text-base mb-8 max-w-xl">Expert-curated video courses. Enroll free and start building real skills today.</p>
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-800 text-sm placeholder-slate-400 shadow-lg border-0 outline-none" placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/20">
            {[{ value: `${courses.length}`, label: 'Online Courses' }, { value: '22+', label: 'Video Lessons' }, { value: 'Expert', label: 'Instruction' }, { value: 'Lifetime', label: 'Access' }].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2"><span className="text-white font-bold text-lg">{value}</span><span className="text-blue-200 text-sm">{label}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${category === cat ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
            ))}
            {enrolledCount > 0 && <div className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium"><CheckCircle size={13} /> {enrolledCount} enrolled</div>}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && <Spinner />}
        {!loading && filtered.length === 0 && <div className="text-center py-20"><BookOpen className="mx-auto text-slate-300 mb-3" size={40} /><p className="text-slate-500 text-sm">{query ? `No courses found for "${query}"` : 'No courses available.'}</p></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const isEnrolling = enrolling === c.id;
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col group">
                <div className={`${accent.bar} h-1.5 w-full`} />
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${accent.icon}`}><BookOpen size={20} /></div>
                    {c.enrolled ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><CheckCircle size={11} /> Enrolled</span>
                    ) : (
                      <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} size={11} className="text-amber-400 fill-amber-400" />)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-bold text-base mb-1.5 group-hover:text-indigo-600 transition">{c.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-100 pt-3">
                    {c.video_count != null && <span className="flex items-center gap-1"><Video size={11} /> {c.video_count} videos</span>}
                    {c.assessment_count != null && c.assessment_count > 0 && <span className="flex items-center gap-1"><ClipboardList size={11} /> {c.assessment_count} quizzes</span>}
                    <span className="flex items-center gap-1 ml-auto"><Users size={11} /> Self-paced</span>
                  </div>
                  {c.enrolled ? (
                    <button onClick={() => navigate(`/courses/${c.id}`)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"><Play size={14} /> Continue Learning</button>
                  ) : (
                    <button onClick={(e) => handleEnroll(e, c.id)} disabled={isEnrolling} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white flex items-center justify-center gap-2 transition">
                      {isEnrolling ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Enrolling...</> : 'Enroll Free'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}