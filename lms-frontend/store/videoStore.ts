import { create } from 'zustand';

interface VideoProgress {
  last_position_seconds: number;
  is_completed: boolean;
}

interface VideoState {
  currentVideoId: number | null;
  progress: Record<number, VideoProgress>;
  setCurrentVideo: (id: number) => void;
  setProgress: (videoId: number, p: VideoProgress) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  progress: {},
  setCurrentVideo: (id) => set({ currentVideoId: id }),
  setProgress: (videoId, p) =>
    set((s) => ({ progress: { ...s.progress, [videoId]: p } })),
}));
