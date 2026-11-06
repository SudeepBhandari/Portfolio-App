import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  Check,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Project } from '../../types';
import { api } from '../../services/api';

export const AdminProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Graphic Design');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [coverImageKey, setCoverImageKey] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [clientName, setClientName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectObjective, setProjectObjective] = useState('');
  const [designProcess, setDesignProcess] = useState('');
  const [finalOutcome, setFinalOutcome] = useState('');

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete confirmation
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const categories = [
    'Graphic Design',
    'UI/UX Design',
    'Branding',
    'Social Media Design',
    'Video Editing',
    'Digital Marketing',
    'Website Design'
  ];

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.adminGetProjects({
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setProjects(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [categoryFilter, statusFilter, search]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      openCreateModal();
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategory('Graphic Design');
    setShortDescription('');
    setDescription('');
    setToolsInput('Figma, Illustrator');
    setCoverImageKey('/src/assets/images/hero_creative_workspace_1793694565600.jpg');
    setFeatured(false);
    setStatus('published');
    setClientName('');
    setProjectUrl('');
    setProjectObjective('');
    setDesignProcess('');
    setFinalOutcome('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setShortDescription(p.short_description || '');
    setDescription(p.description || '');
    setToolsInput(p.tools ? p.tools.join(', ') : '');
    setCoverImageKey(p.cover_image_key || '');
    setFeatured(Boolean(p.featured));
    setStatus(p.status || 'published');
    setClientName(p.client_name || '');
    setProjectUrl(p.project_url || '');
    setProjectObjective(p.project_objective || '');
    setDesignProcess(p.design_process || '');
    setFinalOutcome(p.final_outcome || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const generateSlugFromTitle = (val: string) => {
    setTitle(val);
    if (!editingProject) {
      const s = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(s);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.adminUploadImage(file);
      setCoverImageKey(res.fileKey);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    const toolsArray = toolsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      category,
      short_description: shortDescription,
      description,
      tools: toolsArray,
      cover_image_key: coverImageKey,
      featured,
      status,
      client_name: clientName,
      project_url: projectUrl,
      project_objective: projectObjective,
      design_process: designProcess,
      final_outcome: finalOutcome
    };

    try {
      if (editingProject) {
        await api.adminUpdateProject(editingProject.id, payload);
      } else {
        await api.adminCreateProject(payload);
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save project.');
    } finally {
      setModalLoading(false);
    }
  };

  const togglePublishStatus = async (p: Project) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      await api.adminUpdateProject(p.id, { ...p, status: newStatus });
      await loadProjects();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const toggleFeaturedStatus = async (p: Project) => {
    try {
      await api.adminUpdateProject(p.id, { ...p, featured: !p.featured });
      await loadProjects();
    } catch (err: any) {
      alert('Failed to update featured flag');
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.adminDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err: any) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Project Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Create, edit, feature, and organize your portfolio works and case studies.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Project</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadProjects}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No projects found. Click "Add New Project" to create your first case study.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-800 text-stone-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Cover</th>
                  <th className="py-3 px-4 font-semibold">Title & Slug</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Featured</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-4 w-16">
                      <div className="w-12 h-9 rounded-md overflow-hidden bg-stone-200 dark:bg-stone-800">
                        <img
                          src={p.cover_image_key}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-stone-900 dark:text-stone-100">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-[11px] text-stone-400 font-mono">/projects/{p.slug}</div>
                    </td>

                    <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                      {p.category}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => togglePublishStatus(p)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleFeaturedStatus(p)}
                        className={`text-xs cursor-pointer font-medium ${
                          p.featured
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {p.featured ? '★ Yes' : '☆ No'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'published' && (
                          <a
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-stone-900"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-600 dark:text-stone-300 cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setProjectToDelete(p)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-red-600 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-lg font-bold">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <p className="text-xs text-stone-500">
                  Fill in all project details. Changes will be saved to SQLite / D1 database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => generateSlugFromTitle(e.target.value)}
                    placeholder="e.g. Aether Roasters Identity"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="aether-roasters-identity"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <span>Mark as Featured</span>
                  </label>
                </div>
              </div>

              {/* Cover Image URL / Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold">Cover Image (Artwork / Screenshot) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={coverImageKey}
                    onChange={e => setCoverImageKey(e.target.value)}
                    placeholder="/uploads/my_artwork.jpg or image URL"
                    className="flex-1 text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none font-mono"
                  />

                  <label className="px-3.5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {coverImageKey && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 mt-2">
                    <img
                      src={coverImageKey}
                      alt="Cover Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Short Description (for cards) *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="One sentence summary of the work..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Full Project Narrative / Overview *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Comprehensive case study story, background, and deliverables..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tools / Technologies (Comma-separated)</label>
                  <input
                    type="text"
                    value={toolsInput}
                    onChange={e => setToolsInput(e.target.value)}
                    placeholder="Illustrator, Photoshop, Figma"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Project Objective</label>
                  <textarea
                    rows={2}
                    value={projectObjective}
                    onChange={e => setProjectObjective(e.target.value)}
                    placeholder="What problem did this project solve?"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Design & Strategy Process</label>
                  <textarea
                    rows={2}
                    value={designProcess}
                    onChange={e => setDesignProcess(e.target.value)}
                    placeholder="How was the solution developed?"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Final Outcome & Deliverables</label>
                <textarea
                  rows={2}
                  value={finalOutcome}
                  onChange={e => setFinalOutcome(e.target.value)}
                  placeholder="Key deliverables and impact achieved..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-stone-200 dark:bg-white dark:hover:bg-stone-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Confirm Project Deletion
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900 dark:text-stone-100">"{projectToDelete.title}"</strong>? This will remove its database records and case study page.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
