import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  Settings,
  Cloud,
  LogOut,
  ExternalLink,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, logout, admin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
          <span className="text-xs text-stone-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
          <span className="text-xs text-stone-400">Redirecting to login...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Inquiries', path: '/admin/inquiries', icon: Inbox },
    { label: 'Profile & Settings', path: '/admin/settings', icon: Settings },
    { label: 'Cloudflare Deployment', path: '/admin/deployment', icon: Cloud }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50 dark:bg-[#0c0c0e] text-stone-900 dark:text-stone-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#121215] border-r border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand & Auth Status */}
          <div className="space-y-1">
            <Link to="/admin" className="text-base font-bold tracking-tight block">
              Portfolio Admin
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">{admin?.email}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
