import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Portfolio</span>
          </Link>
          <div className="p-3 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 rounded-2xl w-fit mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Portfolio Administration
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to manage projects, inquiries, profile settings, and CV uploads.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Administrator Credentials Guide */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 text-xs space-y-2 text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator Credentials Guide</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Admin Account: <span className="font-mono bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-400">••••••••••••••••••••</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            Password: <span className="font-mono bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-400">••••••••••••••</span>
          </p>
          <p className="text-[11px] text-stone-400">
            Administrator credentials are hidden for security. Sign in using your private credentials configured during deployment.
          </p>
        </div>
      </div>
    </div>
  );
};
