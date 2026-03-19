import { useEffect, useState, FormEvent } from 'react';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, isValidEmail } from '@/utils/helpers';
import Spinner from '@/components/Spinner';
import { User, Mail, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    authApi.me()
      .then((r) => {
        const u = r.data.user;
        setForm((f) => ({ ...f, name: u.name, email: u.email }));
      })
      .catch(() => {
        if (user) setForm((f) => ({ ...f, name: user.name, email: user.email }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  function validate(): string | null {
    if (form.name.trim().length < 2)    return 'Name must be at least 2 characters.';
    if (!isValidEmail(form.email))      return 'Enter a valid email.';
    if (form.password && form.password.length < 8) return 'New password must be 8+ characters.';
    if (form.password && form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    const msg = validate();
    if (msg) { setError(msg); return; }
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(
        form.name.trim(),
        form.email.trim(),
        form.password || undefined
      );
      // Update store with fresh user + new token
      setAuth(data.user, data.token);
      setForm((f) => ({ ...f, password: '', confirm: '' }));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      {/* Avatar card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center
                        text-xl font-bold text-white flex-shrink-0">
          {form.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-slate-800 font-semibold">{form.name}</p>
          <p className="text-slate-500 text-sm">{form.email}</p>
          <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full mt-1 inline-block">
            Student
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-5">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
              <User size={14} /> Full Name
            </label>
            <input type="text" className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
              <Mail size={14} /> Email Address
            </label>
            <input type="email" className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Lock size={14} /> Change Password
              <span className="text-slate-400 font-normal text-xs">(leave blank to keep current)</span>
            </p>
            <div className="space-y-3">
              <input type="password" className="input" placeholder="New password (8+ characters)"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <input type="password" className="input" placeholder="Confirm new password"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
