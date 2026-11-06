import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle, ArrowUpRight, AlertCircle, Sparkles } from 'lucide-react';
import { ProfileData } from '../types';
import { api } from '../services/api';

export const ResumePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile for resume:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hasUploadedCV = Boolean(profile?.cvUrl);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-stone-200 dark:border-stone-800">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Curriculum Vitae
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Sudip Bhandari – Resume
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Creative Graphic Designer & Digital Marketer
          </p>
        </div>

        {/* Action Button */}
        <div>
          {hasUploadedCV ? (
            <a
              href="/api/cv"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF CV</span>
            </a>
          ) : (
            <div className="text-xs text-stone-500 bg-stone-100 dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800">
              PDF CV available upon direct request
            </div>
          )}
        </div>
      </div>

      {/* CV Status Notice if no custom PDF has been uploaded yet */}
      {!hasUploadedCV && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              A standalone PDF document has not yet been uploaded. In the meantime, you can review Sudip's verified qualifications and skills below.
            </span>
          </div>
          <a
            href="mailto:bhandarysudip5@gmail.com?subject=CV%20Request%20-%20Sudip%20Bhandari"
            className="font-semibold underline shrink-0 hover:text-amber-950 dark:hover:text-amber-100"
          >
            Request PDF
          </a>
        </div>
      )}

      {/* Embedded PDF Viewer if uploaded */}
      {hasUploadedCV && profile?.cvUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Document Preview</span>
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-stone-900 dark:text-stone-200"
            >
              <span>Open in New Tab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 shadow-sm">
            <iframe
              src={profile.cvUrl}
              title="Sudip Bhandari CV Document"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Structured Resume Content */}
      <div className="space-y-10 text-stone-800 dark:text-stone-200">
        {/* Professional Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Professional Profile
          </h2>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {profile?.bio ||
              'I am a creative professional focused on graphic design, UI/UX design, branding, video editing, and digital marketing. I create thoughtful visual experiences and digital solutions that help brands communicate effectively and stand out.'}
          </p>
        </section>

        {/* Core Expertise */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 group">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Brand & Graphic Design
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Typography hierarchies, logo marks, identity style guides, packaging die-lines, and marketing collateral.
              </p>
              <div className="text-[11px] text-stone-500">
                Tools: Adobe Illustrator, Photoshop, InDesign
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 group">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                UI/UX & Web Design
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Mobile & web user interfaces, interactive wireframes, design systems, and responsive layouts.
              </p>
              <div className="text-[11px] text-stone-500">
                Tools: Figma, Responsive Systems, Prototyping
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 group">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Motion & Video Editing
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Dynamic cuts, color grading, audio timing, subtitles, and engaging short-form social reels.
              </p>
              <div className="text-[11px] text-stone-500">
                Tools: Premiere Pro, After Effects
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 group">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Digital Marketing
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Multi-slide social media campaigns, ad creative variations, and conversion-oriented brand strategy.
              </p>
              <div className="text-[11px] text-stone-500">
                Focus: Social Growth, Creative Ads
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Availability */}
        <section className="p-6 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Ready to collaborate?
            </h3>
            <p className="text-xs text-stone-500">
              Available for freelance, contractual, and long-term creative engagements.
            </p>
          </div>
          <a
            href="mailto:bhandarysudip5@gmail.com"
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            Contact Directly
          </a>
        </section>
      </div>
    </div>
  );
};
