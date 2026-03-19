'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import { BookOpen } from 'lucide-react';

interface SubjectTree {
  id: number; title: string; description: string;
  sections: Array<{
    id: number; title: string; order_index: number;
    videos: Array<{ id: number; title: string; is_locked: boolean; is_completed: boolean; }>;
  }>;
}

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectTree | null>(null);

  useEffect(() => {
    api.get(`/subjects/${subjectId}/tree`).then((r) => setSubject(r.data));
  }, [subjectId]);

  if (!subject) return <div className="p-8 text-gray-400">Loading...</div>;

  const firstUnlocked = subject.sections
    .flatMap((s) => s.videos)
    .find((v) => !v.is_locked && !v.is_completed);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="text-indigo-400" size={28} />
        <h1 className="text-2xl font-bold text-white">{subject.title}</h1>
      </div>
      <p className="text-gray-400 mb-8">{subject.description}</p>

      {firstUnlocked && (
        <button
          onClick={() => router.push(`/subjects/${subjectId}/video/${firstUnlocked.id}`)}
          className="mb-8 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold transition">
          Continue Learning →
        </button>
      )}

      <div className="space-y-6">
        {subject.sections.map((sec) => (
          <div key={sec.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 bg-gray-700/50 border-b border-gray-700">
              <h2 className="font-semibold text-white">{sec.title}</h2>
            </div>
            <ul>
              {sec.videos.map((v) => (
                <li key={v.id}
                  onClick={() => !v.is_locked && router.push(`/subjects/${subjectId}/video/${v.id}`)}
                  className={`flex items-center gap-3 px-5 py-3 border-b border-gray-700/50 last:border-0 transition
                    ${v.is_locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700/40'}`}>
                  <span className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center text-xs
                    ${v.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                    {v.is_completed && '✓'}
                  </span>
                  <span className="text-sm text-gray-200">{v.title}</span>
                  {v.is_locked && <span className="ml-auto text-gray-500 text-xs">🔒 Locked</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
