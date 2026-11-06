import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-6xl font-extrabold text-stone-300 dark:text-stone-800 tracking-tight font-mono">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            The page you are looking for does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/projects"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Works</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
