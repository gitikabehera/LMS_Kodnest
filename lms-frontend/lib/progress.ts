import api from './apiClient';

export async function saveProgress(videoId: number, positionSeconds: number, isCompleted: boolean) {
  const { data } = await api.post(`/progress/videos/${videoId}`, {
    last_position_seconds: positionSeconds,
    is_completed: isCompleted,
  });
  return data;
}

export async function getProgress(videoId: number) {
  const { data } = await api.get(`/progress/videos/${videoId}`);
  return data;
}
