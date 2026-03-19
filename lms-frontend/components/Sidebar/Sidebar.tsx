'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/apiClient';
import { useSidebarStore } from '@/store/sidebarStore';
import { ChevronDown, ChevronRight, Lock, CheckCircle, PlayCircle, Menu } from 'lucide-react';

interface Video { id: number; title: string; is_locked: boolean; is_completed: boolean; }
interface Section { id: number; title: string; order_index: number; videos: Video[]; }
interface SubjectTree { id: number; title: string; sections: Section[]; }

export default function Sidebar() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle } = useSidebarStore();
  const [tree, setTree] = useState<SubjectTree | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!subjectId) return;
    api.get(`/subjects/${subjectId}/tree`).then((r) => {
      setTree(r.data);
      // Expand all sections by default
      const exp: Record<number, boolean> = {};
      r.data.sections.forEach((s: Section) => { exp[s.id] = true; });
      setExpanded(exp);
    });
  }, [subjectId]);

  const activeVideoId = pathname.match(/\/video\/(\d+)/)?.[1];

  return (
    <>
      {/* Toggle button */}
      <button onClick={toggle}
        className="fixed top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-700 transition">
        <Menu size={18} />
      </button>

      <aside className={`${isOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden
        bg-gray-900 border-r border-gray-800 flex flex-col h-screen`}>
        <div className="pt-16 pb-4 px-4 border-b border-gray-800">
          <Link href={`/subjects/${subjectId}`} className="text-white font-semibold text-sm hover:text-indigo-300 transition">
            {tree?.title ?? 'Loading...'}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {tree?.sections.map((sec) => (
            <div key={sec.id}>
              <button
                onClick={() => setExpanded((e) => ({ ...e, [sec.id]: !e[sec.id] }))}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition">
                <span>{sec.title}</span>
                {expanded[sec.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {expanded[sec.id] && (
                <ul className="mb-1">
                  {sec.videos.map((v) => {
                    const isActive = String(v.id) === activeVideoId;
                    return (
                      <li key={v.id}>
                        <button
                          disabled={v.is_locked}
                          onClick={() => !v.is_locked && router.push(`/subjects/${subjectId}/video/${v.id}`)}
                          className={`w-full flex items-center gap-2.5 px-5 py-2 text-sm text-left transition
                            ${isActive ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-500' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            ${v.is_locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                          {v.is_completed
                            ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                            : v.is_locked
                              ? <Lock size={15} className="flex-shrink-0" />
                              : <PlayCircle size={15} className="flex-shrink-0 text-indigo-400" />}
                          <span className="truncate">{v.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
