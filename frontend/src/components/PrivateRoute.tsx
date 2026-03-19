import { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function PrivateRoute() {
  const { isAuthenticated, token, clearAuth } = useAuthStore();
  const cleared = useRef(false);

  const expired = !isAuthenticated || !token || isTokenExpired(token);

  // Call clearAuth in an effect, never during render
  useEffect(() => {
    if (expired && !cleared.current) {
      cleared.current = true;
      clearAuth();
    }
  }, [expired, clearAuth]);

  if (expired) return <Navigate to="/login" replace />;
  return <Outlet />;
}
