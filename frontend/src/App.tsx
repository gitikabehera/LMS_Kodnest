import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import PrivateRoute from '@/components/PrivateRoute';

import Login        from '@/pages/Login';
import Register     from '@/pages/Register';
import Dashboard    from '@/pages/Dashboard';
import Courses      from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import Profile      from '@/pages/Profile';
import Certificates from '@/pages/Certificates';
import Leaderboard  from '@/pages/Leaderboard';
import Achievements from '@/pages/Achievements';
import Forum        from '@/pages/Forum';
import Analytics    from '@/pages/Analytics';

/** Layout wrapper for authenticated pages (Navbar + Sidebar + Footer) */
function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
}

/** Minimal layout for auth pages (no sidebar) */
function AuthLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/courses"        element={<Courses />} />
            <Route path="/courses/:id"    element={<CourseDetail />} />
            <Route path="/profile"        element={<Profile />} />
            <Route path="/certificates"   element={<Certificates />} />
            <Route path="/leaderboard"    element={<Leaderboard />} />
            <Route path="/achievements"   element={<Achievements />} />
            <Route path="/forum"          element={<Forum />} />
            <Route path="/analytics"      element={<Analytics />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"   element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
