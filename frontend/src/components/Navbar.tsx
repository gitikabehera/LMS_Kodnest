import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api';
import {
  GraduationCap, LogOut, User, Menu, X,
  LayoutDashboard, BookOpen, Sun, Moon, Bell,
} from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses',   label: 'Courses',   icon: BookOpen },
];

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  }

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <GraduationCap size={26} className="text-indigo-600" />
            <span className="text-slate-800 dark:text-white">Learn<span className="text-indigo-600">Hub</span></span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition
                    ${isActive(to)
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button onClick={toggle}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400
                         hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400
                                   hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <Bell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <Link to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                             text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                             text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30
                             hover:text-red-600 transition">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 text-sm font-medium px-3 py-2">Sign in</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile: dark toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-500 dark:text-slate-400">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="text-slate-500 dark:text-slate-400 p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {label}
                </Link>
              ))}
              <Link to="/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <User size={14} /> {user?.name}
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300">Sign in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-indigo-600 font-medium">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
