'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutApi();
      setUser(null);
      toast.success('Logged out');
      router.push('/');
    } catch {
      toast.error('Logout failed');
    }
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
          {user.name[0].toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-white">{user.name}</h1>
        <p className="text-gray-400 text-sm mb-6">{user.email}</p>
        <button onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg transition">
          Sign Out
        </button>
      </div>
    </div>
  );
}
