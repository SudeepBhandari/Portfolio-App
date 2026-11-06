import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onQuickView?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onQuickView }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group flex flex-col h-full bg-white dark:bg-[#121215] border border-stone-200/90 dark:border-stone-800/90 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-black/70 hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-300 ease-out">
      {/* Visual cover container */}
      <Link
        to={`/projects/${project.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 focus:outline-none"
      >
        {!imageError && project.cover_image_key ? (
          <img
            src={project.cover_image_key}
            alt={project.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-stone-900">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1" />
            <span className="text-xs font-medium text-stone-500">{project.category} Project</span>
          </div>
        )}

        {/* Quiet status marker if draft or featured */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
          {project.featured && (
            <span className="text-[11px] font-medium tracking-wide bg-black/75 dark:bg-black/85 text-stone-100 px-2.5 py-0.5 rounded backdrop-blur-xs">
              Featured
            </span>
          )}
          {project.status === 'draft' && (
            <span className="text-[11px] font-medium tracking-wide bg-amber-500/90 text-white px-2 py-0.5 rounded">
              Draft
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: Clean unboxed text with typographic separators (zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-medium text-stone-700 dark:text-stone-300">{project.category}</span>
            {project.tools && project.tools.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[140px]">{project.tools.slice(0, 2).join(', ')}</span>
              </>
            )}
            {project.client_name && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{project.client_name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            <Link to={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          {/* Short description */}
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
            {project.short_description || project.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-stone-900 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
          >
            <span>View Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(project)}
              className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
            >
              Quick View
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
