'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, LogIn } from 'lucide-react';

interface Subject { id: number; title: string; description: string; slug: string; }

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/subjects').then((r) => setSubjects(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-white">Courses</h1>
        {user ? (
          <span className="text-gray-400 text-sm">Welcome, {user.name}</span>
        ) : (
          <Link href="/auth/login" className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition">
            <LogIn size={16} /> Sign In
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((s) => (
            <Link key={s.id} href={`/subjects/${s.id}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition group border border-gray-700 hover:border-indigo-500">
              <BookOpen className="text-indigo-400 mb-3" size={28} />
              <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 mb-2">{s.title}</h2>
              <p className="text-gray-400 text-sm line-clamp-2">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
