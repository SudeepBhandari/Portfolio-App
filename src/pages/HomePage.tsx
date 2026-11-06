import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Sparkles, MessageCircle, Download } from 'lucide-react';
import { Project, ServiceItem, ProfileData } from '../types';
import { api } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';

interface HomePageProps {
  onOpenHireMe: (service?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenHireMe }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, serv, projs] = await Promise.all([
          api.getProfile(),
          api.getServices(),
          api.getProjects()
        ]);
        setProfile(prof);
        setServices(serv);
        setFeaturedProjects(projs.filter(p => p.featured || true).slice(0, 4));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Branding', 'UI/UX Design', 'Social Media Design', 'Graphic Design'];

  const filteredProjects = selectedCategory === 'All'
    ? featuredProjects
    : featuredProjects.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-24 md:space-y-32 pb-20">
      {/* 1. Hero Section: 2-Column Split */}
      <section className="pt-8 md:pt-16 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Kicker / Subtitle (Clean unboxed text, NO PILL) */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
              <span className="text-stone-900 dark:text-stone-200">Sudip Bhandari</span>
              <span aria-hidden="true">·</span>
              <span>Creative Graphic Designer & Digital Marketer</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-950 dark:text-white leading-[1.08] text-balance">
              Creative Design. Meaningful Digital Experiences.
            </h1>

            {/* Lead Copy */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
              I help brands communicate through thoughtful design, engaging digital experiences, and creative marketing solutions.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenHireMe()}
                className="px-6 py-3.5 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 cursor-pointer group"
              >
                <span>Hire Me</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <Link
                to="/projects"
                className="px-6 py-3.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 group"
              >
                <span>Explore My Work</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href="https://wa.me/9779840631570?text=Hello%20Sudip%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-110 active:scale-95 transition-all duration-200 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                title="Quick WhatsApp message"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column: High-Fidelity Studio Visual */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 min-h-[340px] sm:min-h-[420px] lg:min-h-full group hover:shadow-lg transition-shadow duration-300">
            <img
              src="/src/assets/images/hero_creative_workspace_1793694565600.jpg"
              alt="Creative design workspace with typography posters and high precision graphics"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-white/90">
              <span className="font-medium text-white">Visual Identity & UI Direction</span>
              <span className="mx-2 opacity-60">·</span>
              <span className="text-white/80">Kathmandu / Remote Worldwide</span>
            </div>
          </div>
        </div>

        {/* Full-width discipline strip below the hero split */}
        <div className="mt-14 pt-8 border-t border-stone-200/90 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {[
            'Graphic Design',
            'UI/UX Design',
            'Brand Identity',
            'Social Media',
            'Video Editing',
            'Digital Marketing',
            'Web Design'
          ].map((service, idx) => (
            <div
              key={idx}
              className="flex flex-col py-2 px-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:-translate-y-1 transition-all duration-200 cursor-default"
            >
              <span className="text-stone-400 dark:text-stone-500 font-mono text-[10px]">0{idx + 1}</span>
              <span className="font-semibold text-stone-900 dark:text-stone-200 mt-0.5">{service}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Featured Projects Gallery */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Selected Works
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Crafted with Precision & Purpose
            </h2>
          </div>

          {/* Interactive Category Tabs (Buttons, functional filter controls) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Projects */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(n => (
              <div key={n} className="aspect-[4/3] rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-8">
            <p className="text-sm text-stone-500">No projects currently listed in this category.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="mt-3 text-xs font-medium text-stone-900 dark:text-stone-200 underline hover:text-amber-600 transition-colors cursor-pointer"
            >
              View all works
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
          >
            <span>View All Portfolio Projects</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* 3. Primary Services Overview */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Services & Creative Solutions
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-xl">
            From initial brand conception and identity design to digital interface creation and performance marketing collateral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service, idx) => (
            <div
              key={service.id || idx}
              className="group p-6 bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 rounded-2xl flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-400/30 transition-all duration-300 shadow-xs"
            >
              <div>
                <div className="text-xs font-mono text-stone-400 dark:text-stone-500 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  0{idx + 1}.
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Deliverables
                  </div>
                  {service.deliverables?.map((del, dIdx) => (
                    <div
                      key={dIdx}
                      className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2 transition-transform duration-200 hover:translate-x-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-stone-600 group-hover:bg-amber-500 transition-colors" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                {service.startingPrice ? (
                  <div className="text-xs text-stone-500">
                    From <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">{service.startingPrice}</span>
                  </div>
                ) : (
                  <span className="text-xs text-stone-400">Custom Scope</span>
                )}
                <button
                  type="button"
                  onClick={() => onOpenHireMe(service.title)}
                  className="text-xs font-semibold text-stone-900 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Inquire</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors hover:translate-x-0.5"
          >
            <span>Explore all services, deliverables & process</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 4. About Teaser Section with Verified Profile */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="p-8 sm:p-12 bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
          {/* Avatar Photo */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md">
              <img
                src={profile?.avatarUrl || '/assets/aistudio/sudip_3f6de287.jpeg'}
                alt="Sudip Bhandari Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </div>

          {/* Bio Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              About the Designer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Sudip Bhandari
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              {profile?.bio ||
                'I am a creative professional focused on graphic design, UI/UX design, branding, video editing, and digital marketing. I create thoughtful visual experiences and digital solutions that help brands communicate effectively and stand out.'}
            </p>

            {/* Clean unboxed skills list */}
            <div className="pt-2">
              <div className="text-xs font-medium text-stone-500 mb-2">Core Competencies:</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-700 dark:text-stone-300">
                {profile?.skills?.slice(0, 6).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-default"
                  >
                    <span>{skill}</span>
                    {sIdx < 5 && <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/about"
                className="text-xs font-semibold text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group"
              >
                <span>Read Full Biography & Approach</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/resume"
                className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact / Hire Me CTA Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="p-8 sm:p-14 bg-stone-900 dark:bg-[#18181b] text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Have a Project in Mind?
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Whether you are launching a new brand, redesigning a digital product, or seeking creative marketing visuals, let's create something extraordinary together.
            </p>
            <div className="pt-2 text-xs text-stone-400 flex items-center gap-2">
              <a href="mailto:bhandarysudip5@gmail.com" className="hover:text-white transition-colors">
                Direct: bhandarysudip5@gmail.com
              </a>
              <span aria-hidden="true">·</span>
              <a href="https://wa.me/9779840631570" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                WhatsApp: +977 9840631570
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onOpenHireMe()}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-stone-950 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              Send Project Inquiry
            </button>

            <a
              href="https://wa.me/9779840631570?text=Hello%20Sudip%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
