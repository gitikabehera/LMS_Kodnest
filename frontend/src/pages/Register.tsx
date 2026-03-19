import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { isValidEmail, getErrorMessage } from '@/utils/helpers';
import { GraduationCap, CheckCircle } from 'lucide-react';

const PERKS = [
  'Access to 5 professional courses',
  'Embedded YouTube video lessons',
  'Section assessments & quizzes',
  'Completion certificates & awards',
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (form.name.trim().length < 2)    return 'Name must be at least 2 characters.';
    if (!isValidEmail(form.email))      return 'Enter a valid email address.';
    if (form.password.length < 8)       return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const msg = validate();
    if (msg) { setError(msg); return; }
    setLoading(true);
    try {
      await authApi.register(form.name.trim(), form.email.toLowerCase(), form.password);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-300 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">LearnHub</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-4">Start learning for free today</h1>
          <p className="text-indigo-200 text-lg mb-10">
            Create your account and get instant access to all courses.
          </p>
          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-300 flex-shrink-0" />
                <span className="text-indigo-100 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative border-t border-white/20 pt-6">
          <p className="text-indigo-200 text-sm">Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold underline">Sign in here</Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <GraduationCap size={28} className="text-indigo-600" />
            <span className="text-xl font-bold text-slate-800">Learn<span className="text-indigo-600">Hub</span></span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create your account</h2>
            <p className="text-slate-500 text-sm mb-7">Free forever. No credit card required.</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name',     label: 'Full Name',        type: 'text',     ph: 'Alice Johnson' },
                { key: 'email',    label: 'Email address',    type: 'email',    ph: 'you@example.com' },
                { key: 'password', label: 'Password',         type: 'password', ph: '8+ characters' },
                { key: 'confirm',  label: 'Confirm Password', type: 'password', ph: '••••••••' },
              ].map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <input type={type} className="input" placeholder={ph}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                           text-white font-semibold text-sm transition shadow-sm mt-1">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-slate-500 text-sm mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
