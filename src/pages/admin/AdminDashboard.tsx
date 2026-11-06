import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  FileEdit,
  Inbox,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import { Inquiry } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    publishedProjects: number;
    draftProjects: number;
    totalInquiries: number;
    newInquiries: number;
  }>({
    publishedProjects: 0,
    draftProjects: 0,
    totalInquiries: 0,
    newInquiries: 0
  });

  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.adminGetOverview();
      setStats(data.stats);
      setRecentInquiries(data.recentInquiries);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Published Works',
      value: stats.publishedProjects,
      desc: 'Live on public portfolio',
      icon: FolderKanban
    },
    {
      label: 'Draft Projects',
      value: stats.draftProjects,
      desc: 'Private drafts under review',
      icon: FileEdit
    },
    {
      label: 'Total Inquiries',
      value: stats.totalInquiries,
      desc: 'Lifetime inquiries received',
      icon: Inbox
    },
    {
      label: 'New Unread Inquiries',
      value: stats.newInquiries,
      desc: 'Awaiting your response',
      icon: AlertCircle,
      highlight: stats.newInquiries > 0
    }
  ];

  return (
    <div className="space-y-10">
      {/* Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Studio Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Welcome back, Sudip. Here is a summary of your portfolio activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects?create=true"
            className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadOverview}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                card.highlight
                  ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30'
                  : 'bg-white dark:bg-[#121215] border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
              </div>
              <div className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
                {card.value}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Inquiries Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Recent Project Inquiries
            </h2>
            <p className="text-xs text-stone-500">
              Latest requests submitted through your portfolio contact form.
            </p>
          </div>

          <Link
            to="/admin/inquiries"
            className="text-xs font-semibold text-stone-900 dark:text-white hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-500">
            No inquiries received yet. Once visitors submit the Hire Me form, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-100 dark:border-stone-800/80 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">Client Name</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
                {recentInquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                    <td className="py-3 font-medium text-stone-900 dark:text-stone-100">
                      {inq.full_name}
                      <span className="block text-[11px] text-stone-400 font-normal">{inq.email}</span>
                    </td>
                    <td className="py-3 text-stone-700 dark:text-stone-300">
                      {inq.service}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        inq.status === 'new'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : inq.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-stone-500 tabular-nums">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/inquiries?id=${inq.id}`}
                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded inline-block text-stone-600 dark:text-stone-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/projects"
          className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Manage Projects</h4>
            <p className="text-[11px] text-stone-500">Edit, reorder, or publish case studies</p>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Profile & CV</h4>
            <p className="text-[11px] text-stone-500">Update bio, avatar, and upload PDF resume</p>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          to="/admin/deployment"
          className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Cloudflare & Domain</h4>
            <p className="text-[11px] text-stone-500">D1 database & DNS deployment guide</p>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <a
          href="/downloads/sudip-portfolio-source.zip"
          download="sudip-bhandari-portfolio.zip"
          className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Download Source</h4>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">Get complete .ZIP archive (~4.8MB)</p>
          </div>
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
        </a>
      </div>
    </div>
  );
};
