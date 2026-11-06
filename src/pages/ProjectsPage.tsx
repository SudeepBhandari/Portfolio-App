import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectsPageProps {
  onOpenHireMe: (service?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenHireMe }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = [
    'All',
    'Graphic Design',
    'UI/UX Design',
    'Branding',
    'Social Media Design',
    'Video Editing',
    'Digital Marketing'
  ];

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const data = await api.getProjects({
          category: category !== 'All' ? category : undefined,
          search: search.trim() ? search.trim() : undefined
        });
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);

    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-12">
      {/* Page Title & Intro */}
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Portfolio Archive
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Selected Works & Case Studies
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          Explore a curated collection of graphic design, UI/UX systems, branding packages, and digital marketing creatives. Every project is crafted with visual intentionality and clear brand goals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
                category === cat
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-900/60 hover:bg-stone-200/80 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400 transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="aspect-[4/3] rounded-2xl bg-stone-200 dark:bg-stone-800/60 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-8 space-y-3">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            No projects matched your filter.
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or select "All" to browse all published works.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setSearch('');
            }}
            className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="pt-12 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Looking for something specific?
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            I can provide additional private case studies and bespoke work samples upon request.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenHireMe()}
          className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow cursor-pointer shrink-0"
        >
          Request Custom Sample
        </button>
      </div>
    </div>
  );
};
