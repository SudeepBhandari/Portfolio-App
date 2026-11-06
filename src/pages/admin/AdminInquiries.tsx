import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Inquiry } from '../../types';
import { api } from '../../services/api';

export const AdminInquiries: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [retryingEmail, setRetryingEmail] = useState(false);
  const [emailRetryMessage, setEmailRetryMessage] = useState<string | null>(null);

  // Delete modal
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.adminGetInquiries({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setInquiries(data);

      const targetId = searchParams.get('id');
      if (targetId) {
        const found = data.find(i => i.id === Number(targetId));
        if (found) {
          openDetailModal(found);
        }
      }
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, search]);

  const openDetailModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setAdminNotes(inq.admin_notes || '');
    setEmailRetryMessage(null);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.adminUpdateInquiry(id, { status: newStatus });
      await loadInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      await api.adminUpdateInquiry(selectedInquiry.id, { admin_notes: adminNotes });
      setSelectedInquiry({ ...selectedInquiry, admin_notes: adminNotes });
      await loadInquiries();
    } catch (err: any) {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!selectedInquiry) return;
    setRetryingEmail(true);
    setEmailRetryMessage(null);
    try {
      const res = await api.adminRetryEmail(selectedInquiry.id);
      setEmailRetryMessage(
        res.success
          ? `Email accepted via ${res.provider}!`
          : `Email delivery pending or failed: ${res.errorSummary}`
      );
      await loadInquiries();
    } catch (err: any) {
      setEmailRetryMessage(`Retry error: ${err.message}`);
    } finally {
      setRetryingEmail(false);
    }
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    try {
      await api.adminDeleteInquiry(inquiryToDelete.id);
      setInquiryToDelete(null);
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }
      await loadInquiries();
    } catch (err: any) {
      alert('Failed to delete inquiry');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Inquiries' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Inquiries Inbox
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Review, manage, and respond to client project requests received through the Hire Me form.
        </p>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadInquiries}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-900/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No inquiries match your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Service</th>
                  <th className="py-3 px-4 font-semibold">Budget</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {inquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">
                        {inq.full_name}
                      </div>
                      <div className="text-[11px] text-stone-500">{inq.email}</div>
                      {inq.company && (
                        <div className="text-[10px] text-stone-400 font-medium">{inq.company}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                      {inq.service}
                    </td>

                    <td className="py-3 px-4 text-stone-500 tabular-nums">
                      {inq.budget || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={inq.status}
                        onChange={e => handleStatusChange(inq.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border border-transparent bg-stone-100 dark:bg-stone-800 cursor-pointer ${
                          inq.status === 'new'
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50'
                            : inq.status === 'completed'
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-stone-500 tabular-nums">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetailModal(inq)}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-600 dark:text-stone-300 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInquiryToDelete(inq)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-red-600 cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-xs font-mono text-stone-400">Inquiry #{selectedInquiry.id}</span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {selectedInquiry.full_name}
                </h3>
                <div className="text-xs text-stone-500">{selectedInquiry.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Project%20Inquiry%20Response%20-%20Sudip%20Bhandari`}
                className="px-3 py-1.5 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <a
                href={`https://wa.me/9779840631570?text=${encodeURIComponent(`Hello, regarding your inquiry on my portfolio for ${selectedInquiry.service}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">Service</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedInquiry.service}</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">Company</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedInquiry.company || 'Not provided'}</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">Estimated Budget</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedInquiry.budget || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-0.5">Deadline</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedInquiry.deadline || 'Flexible'}</span>
              </div>
            </div>

            {/* Project Message */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                Project Scope / Message
              </span>
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800 text-xs leading-relaxed whitespace-pre-line text-stone-800 dark:text-stone-200">
                {selectedInquiry.message}
              </div>
            </div>

            {selectedInquiry.reference_url && (
              <div className="text-xs">
                <span className="text-stone-500">Reference link: </span>
                <a
                  href={selectedInquiry.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 dark:text-amber-400 underline font-mono"
                >
                  {selectedInquiry.reference_url}
                </a>
              </div>
            )}

            {/* Email Notification Audit */}
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Notification Delivery Audit</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetryEmail}
                  disabled={retryingEmail}
                  className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${retryingEmail ? 'animate-spin' : ''}`} />
                  <span>Retry Notification</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 space-y-0.5">
                <div>Status: <span className="font-medium text-stone-700 dark:text-stone-300">{selectedInquiry.email_status || 'recorded in DB'}</span></div>
                {selectedInquiry.email_provider && <div>Provider: {selectedInquiry.email_provider}</div>}
                {selectedInquiry.email_error && <div className="text-stone-400">{selectedInquiry.email_error}</div>}
              </div>

              {emailRetryMessage && (
                <div className="text-[11px] text-stone-700 dark:text-stone-200 p-2 rounded bg-stone-100 dark:bg-stone-800 mt-1">
                  {emailRetryMessage}
                </div>
              )}
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Internal Private Notes (Visible only to you)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add meeting notes, agreed scope, quotation details..."
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {inquiryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Delete Inquiry #{inquiryToDelete.id}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Are you sure you want to permanently delete the inquiry from <strong>{inquiryToDelete.full_name}</strong>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInquiryToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
