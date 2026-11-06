import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-stone-800 bg-[#fafaf9] dark:bg-[#0a0a0c] text-stone-600 dark:text-stone-400 py-14 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Title */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Sudip Bhandari
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md leading-relaxed">
              Creative Graphic Designer & Digital Marketer. Crafting thoughtful visual identities, user interfaces, and creative digital solutions for ambitious brands.
            </p>
            <div className="pt-2 text-xs text-stone-500 flex items-center gap-2">
              <span>Kathmandu, Nepal</span>
              <span aria-hidden="true">·</span>
              <span>Global Remote Collaboration</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/projects" className="inline-block hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150">
                  Portfolio Works
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-block hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-block hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150">
                  About & Background
                </Link>
              </li>
              <li>
                <Link to="/resume" className="inline-block hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150">
                  Resume / CV
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-block hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150">
                  Project Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Contact */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider mb-3">
              Direct Channels
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:bhandarysudip5@gmail.com"
                  className="hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150 flex items-center gap-1 group"
                >
                  <span className="truncate">bhandarysudip5@gmail.com</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/9779840631570"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-stone-100 hover:translate-x-1 transition-all duration-150 flex items-center gap-1 group"
                >
                  <span>WhatsApp: +977 9840631570</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/login"
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:underline transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-200 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} Sudip Bhandari. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="tabular-nums">www.sudipbhandari5.com.np</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
