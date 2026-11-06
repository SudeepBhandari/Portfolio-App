import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Check, Sparkles, MessageCircle } from 'lucide-react';
import { ServiceItem } from '../types';
import { api } from '../services/api';

interface ServicesPageProps {
  onOpenHireMe: (service?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenHireMe }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-16">
      {/* Intro */}
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Services & Offerings
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tailored Creative Solutions
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          I provide end-to-end creative direction, visual branding, user interface design, and digital marketing assets for businesses looking to scale their impact.
        </p>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-72 rounded-2xl bg-stone-200 dark:bg-stone-800/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id || idx}
              className="group p-8 bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 rounded-2xl flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 shadow-xs"
            >
              <div>
                <div className="text-xs font-mono text-stone-400 dark:text-stone-500 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  0{idx + 1}.
                </div>

                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {service.title}
                </h2>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
                    Key Deliverables
                  </div>
                  {service.deliverables?.map((item, dIdx) => (
                    <div
                      key={dIdx}
                      className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2 transition-transform duration-200 hover:translate-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-stone-900 dark:text-white shrink-0 mt-0.5 group-hover:text-amber-500 transition-colors" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                <div>
                  {service.startingPrice ? (
                    <div className="text-xs text-stone-500">
                      Starting at <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{service.startingPrice}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400">Custom Scope</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenHireMe(service.title)}
                  className="px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1 cursor-pointer shadow-xs hover:shadow"
                >
                  <span>Inquire</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Process & Methodology */}
      <div className="p-8 sm:p-12 bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Work Methodology
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            How We Collaborate
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 hover:-translate-y-1.5 hover:shadow-md hover:border-stone-400 dark:hover:border-stone-700 transition-all duration-300 space-y-2">
            <span className="font-mono text-stone-400 font-semibold">Step 01</span>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Discovery & Intent</h4>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              We align on your brand identity, audience demographics, competitive positioning, and core objectives.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 hover:-translate-y-1.5 hover:shadow-md hover:border-stone-400 dark:hover:border-stone-700 transition-all duration-300 space-y-2">
            <span className="font-mono text-stone-400 font-semibold">Step 02</span>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Concept & Architecture</h4>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Exploration of moodboards, typographic pairings, structural wireframes, and creative directions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 hover:-translate-y-1.5 hover:shadow-md hover:border-stone-400 dark:hover:border-stone-700 transition-all duration-300 space-y-2">
            <span className="font-mono text-stone-400 font-semibold">Step 03</span>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Refinement & Polish</h4>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Iterative refinement based on your direct feedback, perfecting every detail, contrast ratio, and layout.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 hover:-translate-y-1.5 hover:shadow-md hover:border-stone-400 dark:hover:border-stone-700 transition-all duration-300 space-y-2">
            <span className="font-mono text-stone-400 font-semibold">Step 04</span>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Delivery & Support</h4>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Handoff of production-ready vector assets, Figma files, guideline manuals, and implementation assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
