import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear ALL auth state (localStorage + zustand) and redirect
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Wipe every auth key so zustand + localStorage are in sync
      localStorage.removeItem('accessToken');
      localStorage.removeItem('lms-auth');
      // Only redirect if not already on an auth page
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// ── Types ────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  enrolled?: boolean;
  video_count?: number;
  assessment_count?: number;
}

export interface Assessment {
  id: number;
  section_id: number;
  title: string;
  description: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  youtube_url: string;
  order_index: number;
  duration_seconds: number | null;
  is_completed?: boolean;
}

export interface Section {
  id: number;
  title: string;
  order_index: number;
  videos: Video[];
  assessments: Assessment[];
}

export interface SubjectTree extends Subject {
  sections: Section[];
}

export interface Award {
  id: number;
  title: string;
  issued_at: string;
  subject_title: string;
  slug: string;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  total_videos: number;
  completed_videos: number;
}

export interface DashboardStats {
  totalCourses: number;
  enrolledCourses: number;
  certificates: number;
  enrolled: EnrolledCourse[];
}

// ── API calls ────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post<{ token?: string; accessToken?: string; user: User }>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (name: string, email: string, password?: string) =>
    api.put<{ success: boolean; user: User; token: string }>('/auth/profile', { name, email, password }),
  dashboard: () =>
    api.get<{ success: boolean; data: DashboardStats }>('/auth/dashboard'),
};

export const subjectApi = {
  list:    () => api.get<{ success: boolean; data: Subject[] }>('/subject'),
  getTree: (id: number) => api.get<{ success: boolean; data: SubjectTree }>(`/subject/${id}`),
};

export const enrollApi = {
  enroll: (subjectId: number) =>
    api.post<{ success: boolean; enrolled: boolean; data?: SubjectTree }>('/enroll', { subject_id: subjectId }),
};

export const awardsApi = {
  list: () => api.get<{ success: boolean; data: Award[] }>('/awards'),
};

export const progressApi = {
  save: (videoId: number, positionSeconds: number, isCompleted: boolean) =>
    api.post(`/progress/videos/${videoId}`, {
      last_position_seconds: positionSeconds,
      is_completed: isCompleted,
    }),
};

export default api;
