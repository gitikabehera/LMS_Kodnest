'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import { saveProgress } from '@/lib/progress';
import { useVideoStore } from '@/store/videoStore';
import toast from 'react-hot-toast';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoData {
  id: number; title: string; description: string;
  youtube_url: string; duration_seconds: number | null;
  is_locked: boolean;
  previous_video_id: number | null;
  next_video_id: number | null;
  progress: { last_position_seconds: number; is_completed: boolean; };
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

export default function VideoPage() {
  const { subjectId, videoId } = useParams<{ subjectId: string; videoId: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const setProgress = useVideoStore((s) => s.setProgress);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/videos/${videoId}`)
      .then((r) => {
        setVideo(r.data);
        if (r.data.is_locked) toast.error('Complete the previous video first');
      })
      .catch(() => toast.error('Failed to load video'))
      .finally(() => setLoading(false));

    return () => { if (saveIntervalRef.current) clearInterval(saveIntervalRef.current); };
  }, [videoId]);

  const markComplete = useCallback(async () => {
    if (!video || video.progress.is_completed) return;
    try {
      const updated = await saveProgress(video.id, video.duration_seconds ?? 0, true);
      setProgress(video.id, updated);
      setVideo((v) => v ? { ...v, progress: { ...v.progress, is_completed: true } } : v);
      toast.success('Video completed!');
    } catch { /* silent */ }
  }, [video, setProgress]);

  const goNext = useCallback(() => {
    if (video?.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${video.next_video_id}`);
    }
  }, [video, subjectId, router]);

  if (loading) return <div className="p-8 text-gray-400">Loading video...</div>;
  if (!video) return <div className="p-8 text-red-400">Video not found.</div>;

  if (video.is_locked) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <Lock size={48} className="text-gray-600" />
        <p className="text-lg">This video is locked.</p>
        <p className="text-sm">Complete the previous video to unlock.</p>
        {video.previous_video_id && (
          <button onClick={() => router.push(`/subjects/${subjectId}/video/${video.previous_video_id}`)}
            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition">
            Go to Previous Video
          </button>
        )}
      </div>
    );
  }

  const ytId = extractYouTubeId(video.youtube_url);
  const startAt = video.progress.last_position_seconds ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6">
        {ytId ? (
          <iframe
            ref={playerRef}
            src={`https://www.youtube.com/embed/${ytId}?start=${startAt}&enablejsapi=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Invalid YouTube URL</div>
        )}
      </div>

      {/* Title + Controls */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">{video.title}</h1>
          {video.description && <p className="text-gray-400 text-sm mt-1">{video.description}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {video.previous_video_id && (
            <button onClick={() => router.push(`/subjects/${subjectId}/video/${video.previous_video_id}`)}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition">
              <ChevronLeft size={16} /> Prev
            </button>
          )}
          {!video.progress.is_completed && (
            <button onClick={markComplete}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Mark Complete
            </button>
          )}
          {video.progress.is_completed && video.next_video_id && (
            <button onClick={goNext}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {video.progress.is_completed && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 text-sm px-4 py-2 rounded-lg">
          ✓ You have completed this video.
        </div>
      )}
    </div>
  );
}
