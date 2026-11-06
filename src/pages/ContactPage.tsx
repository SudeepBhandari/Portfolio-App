import React, { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company: '',
    service: 'Graphic Design',
    message: '',
    budget: '',
    deadline: '',
    preferred_contact: 'Email',
    reference_url: '',
    website_hp: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    inquiryId: number;
    message: string;
    whatsAppUrl: string;
  } | null>(null);

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
      setSuccess(res);
      setFormData({
        full_name: '',
        email: '',
        company: '',
        service: 'Graphic Design',
        message: '',
        budget: '',
        deadline: '',
        preferred_contact: 'Email',
        reference_url: '',
        website_hp: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again or message via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 space-y-16">
      {/* Intro Header */}
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Get in Touch
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Let's Build Something Exceptional
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          Have an upcoming brand design, digital product, or creative marketing campaign? Fill out the project brief below or reach out directly on WhatsApp or Email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Direct Channels Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Direct Contact
            </h2>

            {/* Email item */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-semibold text-stone-900 dark:text-stone-100">Email Address</span>
                <p className="text-stone-500">For inquiries, briefs, and RFPs</p>
                <a
                  href="mailto:bhandarysudip5@gmail.com"
                  className="inline-block font-medium text-stone-900 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors pt-0.5 break-all"
                >
                  bhandarysudip5@gmail.com
                </a>
              </div>
            </div>

            {/* WhatsApp item */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-semibold text-stone-900 dark:text-stone-100">WhatsApp Quick Chat</span>
                <p className="text-stone-500">Fastest response for project inquiries</p>
                <a
                  href="https://wa.me/9779840631570?text=Hello%20Sudip%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors pt-0.5"
                >
                  <span>+977 9840631570</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 space-y-2">
            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy & Confidentiality</span>
            </div>
            <p className="leading-relaxed">
              Your inquiry information is saved securely in our database and used strictly by Sudip Bhandari to respond to your project request. No unsolicited sales or third-party sharing.
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 shadow-xs">
            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Inquiry Sent Successfully</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  {success.message}
                </p>
                <div className="text-xs text-stone-500">
                  Reference ID: <span className="font-mono font-medium">#{success.inquiryId}</span>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={success.whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open in WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSuccess(null)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Project Inquiry Form
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Please provide as much detail as possible to receive an accurate timeline and proposal.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Honeypot field */}
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
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
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
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
                    Project Scope & Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your project, deliverables needed, style references, and expectations..."
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
                      placeholder="e.g. $500 - $1,500"
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Desired Deadline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Weeks"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Preferred Channel
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
                    Inspiration / Brand Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourbrand.com or https://pinterest.com/..."
                    value={formData.reference_url}
                    onChange={e => setFormData({ ...formData, reference_url: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Project Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
