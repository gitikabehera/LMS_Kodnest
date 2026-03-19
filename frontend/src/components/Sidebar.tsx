import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, User, Award,
  Trophy, MessageSquare, BarChart2, Flame,
} from 'lucide-react';

const MAIN_LINKS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/courses',      label: 'Courses',      icon: BookOpen },
  { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { to: '/achievements', label: 'Achievements', icon: Flame },
  { to: '/forum',        label: 'Discussion',   icon: MessageSquare },
  { to: '/analytics',   label: 'My Progress',  icon: BarChart2 },
];

const ACCOUNT_LINKS = [
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/profile',      label: 'Profile',      icon: User },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
         ${isActive
           ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`
      }>
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-slate-900
                      border-r border-slate-200 dark:border-slate-700 min-h-screen pt-6 px-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Learn</p>
      <nav className="space-y-0.5 mb-6">
        {MAIN_LINKS.map((l) => <NavItem key={l.to} {...l} />)}
      </nav>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Account</p>
      <nav className="space-y-0.5">
        {ACCOUNT_LINKS.map((l) => <NavItem key={l.to} {...l} />)}
      </nav>
    </aside>
  );
}
