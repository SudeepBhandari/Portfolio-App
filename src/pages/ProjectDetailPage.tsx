import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MessageCircle, ExternalLink, Calendar, Wrench, Building2, Eye } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';
import { ImageLightbox } from '../components/ImageLightbox';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectDetailPageProps {
  onOpenHireMe: (service?: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ onOpenHireMe }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchProject() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProjectBySlug(slug);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Project not found');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-12 w-3/4 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="aspect-[16/9] w-full bg-stone-200 dark:bg-stone-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-sm text-stone-500">
          The requested project might have been updated, unpublished, or moved.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </Link>
      </div>
    );
  }

  // Prepare images list for lightbox
  const allImages = [
    { url: project.cover_image_key, caption: `${project.title} - Cover Artwork` },
    ...(project.images || []).map(img => ({ url: img.image_key, caption: img.alt_text }))
  ];

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 space-y-12">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-all duration-200 hover:-translate-x-1 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to all works</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        {/* Unboxed metadata with separators */}
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
          <span className="text-stone-900 dark:text-stone-200 font-semibold">{project.category}</span>
          {project.client_name && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.client_name}</span>
            </>
          )}
          {project.published_at && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {new Date(project.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          {project.title}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
          {project.short_description}
        </p>
      </div>

      {/* Main Cover Image */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm group hover:shadow-xl transition-shadow duration-300">
        <img
          src={project.cover_image_key}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full aspect-[16/9] object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
        />
        <button
          type="button"
          onClick={() => openLightboxAt(0)}
          className="absolute bottom-4 right-4 bg-black/75 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 transition-all opacity-90 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View High-Res</span>
        </button>
      </div>

      {/* Project Meta Details Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs">
        <div>
          <span className="block text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
            Category
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">{project.category}</span>
        </div>

        <div>
          <span className="block text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
            Client
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {project.client_name || 'Independent / Creative Concept'}
          </span>
        </div>

        <div>
          <span className="block text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
            Tools Used
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {project.tools && project.tools.length > 0 ? project.tools.join(', ') : 'Creative Suite'}
          </span>
        </div>

        <div>
          <span className="block text-stone-400 dark:text-stone-500 uppercase tracking-wider text-[10px] font-semibold mb-1">
            Live Preview
          </span>
          {project.project_url ? (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-stone-400">Available in Case Study</span>
          )}
        </div>
      </div>

      {/* Comprehensive Narrative / Case Study */}
      <div className="space-y-10 pt-4 text-stone-800 dark:text-stone-200">
        {/* Full Overview */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Overview & Context
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
            {project.description}
          </p>
        </section>

        {/* Objective */}
        {project.project_objective && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Project Objective
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
              {project.project_objective}
            </p>
          </section>
        )}

        {/* Design Process */}
        {project.design_process && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Design & Strategy Process
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
              {project.design_process}
            </p>
          </section>
        )}

        {/* Final Outcome */}
        {project.final_outcome && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Final Deliverables & Outcome
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
              {project.final_outcome}
            </p>
          </section>
        )}
      </div>

      {/* Additional Images Gallery */}
      {project.images && project.images.length > 0 && (
        <section className="space-y-4 pt-6">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Additional Visuals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => openLightboxAt(i + 1)}
                className="group relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 aspect-[4/3] cursor-pointer hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={img.image_key}
                  alt={img.alt_text}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-medium">
                  Click to Expand
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Project CTA Bar */}
      <div className="p-8 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow duration-300">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Interested in a similar project for your brand?
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Let's discuss requirements, timelines, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenHireMe(project.category)}
            className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold text-stone-950 bg-white hover:bg-stone-50 dark:bg-stone-100 dark:hover:bg-white rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-xs hover:shadow cursor-pointer text-center"
          >
            Inquire About This Service
          </button>
          <a
            href={`https://wa.me/9779840631570?text=${encodeURIComponent(`Hello Sudip, I saw your project "${project.title}" on your portfolio and would like to discuss something similar.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-xs hover:shadow"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Related Projects */}
      {project.related && project.related.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-stone-200 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            More {project.category} Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {project.related.map(rel => (
              <ProjectCard key={rel.id} project={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={allImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex(prev => (prev + 1) % allImages.length)}
        onPrev={() => setLightboxIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
      />
    </div>
  );
};
