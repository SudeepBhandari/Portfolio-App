import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenHireMe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHireMe }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Work', path: '/projects' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Resume', path: '/resume' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/projects' && (location.pathname === '/projects' || location.pathname.startsWith('/projects/'))) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#fafaf9]/90 dark:bg-[#0a0a0c]/90 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-lg md:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          Sudip Bhandari
        </Link>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-400">
          {navLinks.map(link => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 group ${
                  active
                    ? 'text-stone-950 dark:text-white font-semibold'
                    : 'hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <span>{link.label}</span>
                {/* Active or hover underline indicator */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 dark:bg-white rounded-full transition-all duration-200 ${
                    active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-70 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg transition-all duration-200 hover:rotate-12 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white px-2.5 py-1.5 rounded border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-200 whitespace-nowrap"
            >
              Dashboard
            </Link>
          )}

          {onOpenHireMe ? (
            <button
              type="button"
              onClick={onOpenHireMe}
              className="px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-100 dark:bg-stone-100 hover:bg-stone-200 dark:hover:bg-white rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:shadow border border-stone-200 dark:border-stone-700"
            >
              Hire Me
            </button>
          ) : (
            <Link
              to="/contact"
              className="px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-100 dark:bg-stone-100 hover:bg-stone-200 dark:hover:bg-white rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0 shadow-sm hover:shadow border border-stone-200 dark:border-stone-700"
            >
              Hire Me
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-[#fafaf9] dark:bg-[#0a0a0c] px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium py-2 transition-colors ${
                isActive(link.path)
                  ? 'text-stone-900 dark:text-white font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium py-2 text-amber-600 dark:text-amber-400"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-2">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-stone-950 bg-stone-100 dark:bg-white rounded-lg"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
