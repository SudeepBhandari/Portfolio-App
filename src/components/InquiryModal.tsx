import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, initialService }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company: '',
    service: initialService || 'Graphic Design',
    message: '',
    budget: '',
    deadline: '',
    preferred_contact: 'Email',
    reference_url: '',
    website_hp: '' // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    inquiryId: number;
    message: string;
    whatsAppUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const servicesList = [
    'Graphic Design',
    'UI/UX Design',
    'Branding and Brand Identity',
    'Social Media Design',
    'Video Editing',
    'Digital Marketing',
    'Website Design and Creative Digital Solutions',
    'Other / Custom Scope'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.submitInquiry(formData);
      setSuccessData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSuccessData(null);
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {successData ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Inquiry Received!</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              {successData.message}
            </p>
            <div className="pt-2 text-xs text-stone-500">
              Reference ID: <span className="font-mono font-medium">#{successData.inquiryId}</span>
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={successData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Continue on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">Start a Project Inquiry</h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Share your requirements, timeline, and goals with Sudip Bhandari.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field (hidden from genuine users) */}
              <input
                type="text"
                name="website_hp"
                value={formData.website_hp}
                onChange={e => setFormData({ ...formData, website_hp: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Sharma"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Company or Brand (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Studio"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Service Required *
                  </label>
                  <select
                    value={formData.service}
                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                  >
                    {servicesList.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Project Description & Goals *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell me about what you are building, design preferences, and desired outcomes..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $300 - $800"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2-3 Weeks"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Contact
                  </label>
                  <select
                    value={formData.preferred_contact}
                    onChange={e => setFormData({ ...formData, preferred_contact: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Video Call">Video Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Reference Link or Inspiration (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/inspiration"
                  value={formData.reference_url}
                  onChange={e => setFormData({ ...formData, reference_url: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <span className="text-[11px] text-stone-500">
                  Data is confidential and used only to respond to your project request.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
