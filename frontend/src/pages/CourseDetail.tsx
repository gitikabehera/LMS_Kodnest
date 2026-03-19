import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subjectApi, enrollApi, progressApi, type SubjectTree, type Video, type Section } from '@/api';
import Spinner from '@/components/Spinner';
import { formatDuration } from '@/utils/helpers';
import {
  CheckCircle, Lock, PlayCircle, ChevronDown, ChevronRight,
  ArrowLeft, BookOpen, Play, ClipboardList, CheckSquare,
} from 'lucide-react';

type PageState = 'loading' | 'locked' | 'error' | 'ready';

/** Normalise any YouTube URL to embed format */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Already embed format
  if (url.includes('/embed/')) return url.includes('?') ? url : `${url}?rel=0`;
  // watch?v= format
  const watchMatch = url.match(/[?&]v=([^&#]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0`;
  // youtu.be format
  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0`;
  return null;
}

export default function CourseDetail() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [pageState, setPageState]     = useState<PageState>('loading');
  const [course, setCourse]           = useState<SubjectTree | null>(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [expanded, setExpanded]       = useState<Record<number, boolean>>({});
  const [enrolling, setEnrolling]     = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [marking, setMarking]         = useState(false);

  function applyData(data: SubjectTree) {
    setCourse(data);
    const exp: Record<number, boolean> = {};
    (data.sections ?? []).forEach((s: Section) => { exp[s.id] = true; });
    setExpanded(exp);
    const first = (data.sections ?? []).flatMap((s: Section) => s.videos)[0] ?? null;
    setActiveVideo(first);
    setPageState('ready');
  }

  const loadCourse = useCallback(async () => {
    if (!id) return;
    setPageState('loading');
    setEnrollError('');
    try {
      const r    = await subjectApi.getTree(Number(id));
      applyData(r.data.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? '';
      if (status === 403 || msg.toLowerCase().includes('enroll')) {
        setPageState('locked');
      } else if (status === 401) {
        navigate('/login');
      } else {
        setErrorMsg(msg || 'Failed to load course.');
        setPageState('error');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    // If we arrived here with pre-loaded data (from enrollment), use it directly
    const navData = (location.state as { courseData?: SubjectTree } | null)?.courseData;
    if (navData) {
      applyData(navData);
      // Clear the state so a browser refresh loads fresh from API
      window.history.replaceState({}, '');
    } else {
      loadCourse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markVideoComplete(video: Video) {
    if (video.is_completed || marking) return;
    setMarking(true);
    try {
      await progressApi.save(video.id, video.duration_seconds ?? 0, true);
      // Update local state so UI reflects completion immediately
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) => ({
            ...s,
            videos: s.videos.map((v) => v.id === video.id ? { ...v, is_completed: true } : v),
          })),
        };
      });
      if (activeVideo?.id === video.id) {
        setActiveVideo((v) => v ? { ...v, is_completed: true } : v);
      }
    } catch {
      // silently ignore — progress save is non-critical
    } finally {
      setMarking(false);
    }
  }

  async function handleEnroll() {
    if (!id) return;
    setEnrolling(true);
    setEnrollError('');
    try {
      const res = await enrollApi.enroll(Number(id));
      const data = res.data.data;
      // Backend returns full tree — use it directly, no second request needed
      if (data) {
        setCourse(data);
        const exp: Record<number, boolean> = {};
        (data.sections ?? []).forEach((s: Section) => { exp[s.id] = true; });
        setExpanded(exp);
        const first = (data.sections ?? []).flatMap((s: Section) => s.videos)[0] ?? null;
        setActiveVideo(first);
        setPageState('ready');
      } else {
        await loadCourse();
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      if (status === 401) { navigate('/login'); return; }
      setEnrollError(msg || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  }

  if (pageState === 'loading') return <Spinner />;

  if (pageState === 'locked') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <div className="p-5 bg-indigo-50 rounded-full border border-indigo-100">
        <Lock size={44} className="text-indigo-500" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Locked</h2>
        <p className="text-slate-500 max-w-sm text-sm">Enroll to access all sections, videos and assessments.</p>
      </div>
      {enrollError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{enrollError}</p>
      )}
      <div className="flex gap-3">
        <button onClick={() => navigate('/courses')}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600
                     hover:bg-slate-50 text-sm font-medium transition">
          Back to Courses
        </button>
        <button onClick={handleEnroll} disabled={enrolling}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                     text-white text-sm font-semibold transition flex items-center gap-2">
          {enrolling ? (
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>Enrolling...</>
          ) : <><BookOpen size={15} /> Enroll &amp; Start Learning</>}
        </button>
      </div>
    </div>
  );

  if (pageState === 'error') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <p className="text-red-500 text-sm">{errorMsg}</p>
      <button onClick={() => navigate('/courses')} className="btn-primary">Back to Courses</button>
    </div>
  );

  if (!course) return null;

  const embedUrl     = activeVideo ? getEmbedUrl(activeVideo.youtube_url) : null;
  const totalVideos = course.sections.reduce((n, s) => n + s.videos.length, 0);
  const totalAssess = course.sections.reduce((n, s) => n + (s.assessments?.length ?? 0), 0);
  const completed   = course.sections.flatMap((s) => s.videos).filter((v) => v.is_completed).length;
  const pct         = totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0;

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-4 border-b border-slate-200">
          <button onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition">
            <ArrowLeft size={14} /> All Courses
          </button>
          <h2 className="text-slate-800 font-semibold text-sm leading-snug">{course.title}</h2>
          <p className="text-slate-400 text-xs mt-1">
            {course.sections.length} sections · {totalVideos} videos
            {totalAssess > 0 && ` · ${totalAssess} quizzes`}
          </p>
          {totalVideos > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span><span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((sec, si) => (
            <div key={sec.id}>
              <button
                onClick={() => setExpanded((e) => ({ ...e, [sec.id]: !e[sec.id] }))}
                className="w-full flex items-center justify-between px-4 py-3
                           text-xs font-semibold text-slate-500 uppercase tracking-wider
                           hover:bg-slate-50 transition border-b border-slate-100">
                <span>{si + 1}. {sec.title}</span>
                {expanded[sec.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              {expanded[sec.id] && (
                <ul>
                  {sec.videos.map((v, vi) => {
                    const isActive = activeVideo?.id === v.id;
                    return (
                      <li key={v.id}>
                        <button onClick={() => setActiveVideo(v)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition
                            border-b border-slate-100 last:border-0
                            ${isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'}`}>
                          <div className="flex-shrink-0">
                            {v.is_completed
                              ? <CheckCircle size={14} className="text-emerald-500" />
                              : <PlayCircle size={14} className={isActive ? 'text-indigo-500' : 'text-slate-400'} />}
                          </div>
                          <span className={`truncate flex-1 text-xs font-medium
                            ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>
                            {vi + 1}. {v.title}
                          </span>
                          {v.duration_seconds != null && (
                            <span className="text-xs text-slate-400 flex-shrink-0">
                              {formatDuration(v.duration_seconds)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  {/* Assessments in sidebar */}
                  {sec.assessments?.map((a) => (
                    <li key={`a-${a.id}`}>
                      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-100 bg-amber-50/50">
                        <ClipboardList size={13} className="text-amber-500 flex-shrink-0" />
                        <span className="text-xs text-amber-700 font-medium truncate">{a.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {activeVideo ? (
          <div className="p-6 max-w-4xl mx-auto">
            {/* Player */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-xl">
              {embedUrl ? (
                <iframe key={embedUrl}
                  src={embedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="w-full h-full" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <Play size={40} className="text-slate-600" />
                  <p className="text-sm">Video unavailable. Please try another lesson.</p>
                </div>
              )}
            </div>

            {/* Video info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-800">{activeVideo.title}</h1>
                  {activeVideo.description && (
                    <p className="text-slate-500 text-sm mt-1">{activeVideo.description}</p>
                  )}
                  {activeVideo.duration_seconds != null && (
                    <p className="text-slate-400 text-xs mt-2">Duration: {formatDuration(activeVideo.duration_seconds)}</p>
                  )}
                </div>
                <button
                  onClick={() => markVideoComplete(activeVideo)}
                  disabled={activeVideo.is_completed || marking}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
                    ${activeVideo.is_completed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'}`}
                >
                  <CheckSquare size={15} />
                  {activeVideo.is_completed ? 'Completed' : marking ? 'Saving...' : 'Mark Complete'}
                </button>
              </div>
            </div>

            {/* Mobile: full course content */}
            <div className="lg:hidden space-y-4">
              {course.sections.map((sec, si) => (
                <div key={sec.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700">{si + 1}. {sec.title}</h3>
                  </div>
                  {sec.videos.map((v, vi) => (
                    <button key={v.id} onClick={() => setActiveVideo(v)}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-left border-b border-slate-100
                        ${activeVideo?.id === v.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                      <PlayCircle size={14} className={activeVideo?.id === v.id ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className="text-xs text-slate-600">{vi + 1}. {v.title}</span>
                    </button>
                  ))}
                  {sec.assessments?.map((a) => (
                    <div key={`a-${a.id}`}
                      className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-amber-50/50">
                      <ClipboardList size={13} className="text-amber-500" />
                      <div>
                        <p className="text-xs font-medium text-amber-700">{a.title}</p>
                        {a.description && <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
            <Play size={48} className="text-slate-300" />
            <p className="text-sm">Select a lesson from the sidebar to begin</p>
          </div>
        )}
      </main>
    </div>
  );
}
