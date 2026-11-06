import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowUpRight, Mail, MessageCircle, MapPin, Globe } from 'lucide-react';
import { ProfileData } from '../types';
import { api } from '../services/api';

export const AboutPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 space-y-16">
      {/* Intro Header */}
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          About the Creator
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Sudip Bhandari
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-medium">
          Creative Graphic Designer & Digital Marketer
        </p>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Profile Image & Quick Facts */}
        <div className="md:col-span-5 space-y-6">
          <div className="group relative aspect-4/5 sm:aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <img
              src={profile?.avatarUrl || '/assets/aistudio/sudip_3f6de287.jpeg'}
              alt="Sudip Bhandari"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          <div className="p-5 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:translate-x-1 transition-transform duration-150">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <span>Kathmandu, Nepal</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:translate-x-1 transition-transform duration-150">
              <Globe className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <span>Available for Global Remote Projects</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:translate-x-1 transition-transform duration-150">
              <Mail className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <a href="mailto:bhandarysudip5@gmail.com" className="hover:underline hover:text-stone-900 dark:hover:text-white truncate">
                bhandarysudip5@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:translate-x-1 transition-transform duration-150">
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <a href="https://wa.me/9779840631570" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400">
                WhatsApp: +977 9840631570
              </a>
            </div>
          </div>

          <div>
            <Link
              to="/resume"
              className="w-full py-3 px-4 bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>View & Download CV</span>
            </Link>
          </div>
        </div>

        {/* Biography & Philosophy */}
        <div className="md:col-span-7 space-y-8 text-stone-700 dark:text-stone-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Biography
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {profile?.bio ||
                'I am a creative professional focused on graphic design, UI/UX design, branding, video editing, and digital marketing. I create thoughtful visual experiences and digital solutions that help brands communicate effectively and stand out.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Design Philosophy & Approach
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {profile?.approach ||
                'Every project begins with deep listening and understanding the core brand intent. I combine disciplined typography, spatial hierarchy, and visual balance with conversion-focused digital marketing strategy.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Professional Objectives
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {profile?.goals ||
                'To collaborate with ambitious businesses and founders to craft memorable brand identities, intuitive digital products, and high-converting marketing campaigns.'}
            </p>
          </section>

          {/* Disciplines & Skills list */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Core Skills & Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(profile?.skills || [
                'Graphic Design',
                'UI/UX Design',
                'Branding & Visual Identity',
                'Social Media Design',
                'Video Editing & Color Grading',
                'Digital Marketing',
                'Website Design',
                'Design Systems'
              ]).map((skill, idx) => (
                <div
                  key={idx}
                  className="group p-3 rounded-lg bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2 hover:-translate-y-0.5 hover:border-amber-500/40 dark:hover:border-amber-400/30 hover:shadow-xs transition-all duration-200 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-white group-hover:bg-amber-500 transition-colors" />
                  <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
