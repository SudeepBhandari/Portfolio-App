import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { run, get, all } from './db';
import {
  createSession,
  invalidateSession,
  setSessionCookie,
  clearSessionCookie,
  requireAdminAuth,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  checkContactRateLimit
} from './auth';
import { sendInquiryNotification } from './email';

const router = express.Router();

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `img_${safeBase}_${uniqueSuffix}${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  }
});

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `sudip_bhandari_cv_${Date.now()}.pdf`);
  }
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('CV must be a PDF document.'));
    }
  }
});

/* ==========================================
   PUBLIC API ENDPOINTS
   ========================================== */

// GET /api/health
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const adminCheck = await get('SELECT COUNT(*) as count FROM admins');
    res.json({
      status: 'healthy',
      database: 'connected',
      adminInitialized: (adminCheck?.count || 0) > 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// GET /api/profile
router.get('/profile', async (_req: Request, res: Response) => {
  try {
    const row = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['profile_data']
    );
    if (!row) {
      res.status(404).json({ error: 'Profile data not found' });
      return;
    }
    const profile = JSON.parse(row.setting_value);
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// GET /api/services
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const row = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['services_data']
    );
    if (!row) {
      res.json([]);
      return;
    }
    const services = JSON.parse(row.setting_value);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// GET /api/projects (Public: only published projects)
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;

    let query = `
      SELECT id, title, slug, short_description, description, category, tools_json,
             cover_image_key, featured, status, client_name, project_url, case_study_url,
             project_objective, design_process, final_outcome, created_at, published_at
      FROM projects
      WHERE status = 'published'
    `;
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim().length > 0) {
      query += ' AND (title LIKE ? OR short_description LIKE ? OR category LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY featured DESC, id DESC';

    const projects = await all(query, params);

    const formatted = projects.map(p => ({
      ...p,
      tools: JSON.parse(p.tools_json || '[]'),
      featured: Boolean(p.featured)
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// GET /api/projects/:slug (Public: single published project)
router.get('/projects/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const project = await get(
      `SELECT * FROM projects WHERE slug = ? AND status = 'published'`,
      [slug]
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Fetch additional project images
    const images = await all(
      'SELECT id, image_key, alt_text, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC',
      [project.id]
    );

    // Fetch related projects in same category
    const related = await all(
      `SELECT id, title, slug, cover_image_key, category, short_description
       FROM projects
       WHERE category = ? AND id != ? AND status = 'published'
       LIMIT 3`,
      [project.category, project.id]
    );

    res.json({
      ...project,
      tools: JSON.parse(project.tools_json || '[]'),
      featured: Boolean(project.featured),
      images,
      related
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load project details' });
  }
});

// POST /api/inquiries (Public Hire Me form with validation, spam protection, rate limiting)
router.post('/inquiries', checkContactRateLimit, async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      company,
      service,
      message,
      budget,
      deadline,
      preferred_contact,
      reference_url,
      // Honeypot field - must be empty
      website_hp
    } = req.body;

    // Honeypot check
    if (website_hp) {
      // Quietly acknowledge without saving spam bot
      res.json({ success: true, message: 'Inquiry received.' });
      return;
    }

    // Validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!service || typeof service !== 'string' || service.trim().length === 0) {
      res.status(400).json({ error: 'Please select a required service.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      res.status(400).json({ error: 'Please describe your project (minimum 10 characters).' });
      return;
    }

    // Save inquiry to database
    const result = await run(`
      INSERT INTO inquiries (
        full_name, email, company, service, message, budget, deadline,
        preferred_contact, reference_url, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      full_name.trim(),
      email.trim().toLowerCase(),
      company ? company.trim() : null,
      service.trim(),
      message.trim(),
      budget ? budget.trim() : null,
      deadline ? deadline.trim() : null,
      preferred_contact ? preferred_contact.trim() : 'Email',
      reference_url ? reference_url.trim() : null
    ]);

    const newInquiryId = result.lastID;

    // Trigger transactional email notification asynchronously without blocking response
    sendInquiryNotification({
      id: newInquiryId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : undefined,
      service: service.trim(),
      message: message.trim(),
      budget: budget ? budget.trim() : undefined,
      deadline: deadline ? deadline.trim() : undefined,
      preferred_contact: preferred_contact ? preferred_contact.trim() : undefined,
      reference_url: reference_url ? reference_url.trim() : undefined
    }).catch(err => {
      console.error('Email notification background error:', err);
    });

    res.status(201).json({
      success: true,
      inquiryId: newInquiryId,
      message: 'Thank you! Your project inquiry has been successfully received. I will review it and get back to you shortly.',
      whatsAppUrl: `https://wa.me/9779840631570?text=${encodeURIComponent(`Hello Sudip, I just sent a project inquiry regarding ${service.trim()} on your portfolio.`)}`
    });
  } catch (err: any) {
    console.error('Inquiry submission error:', err);
    res.status(500).json({ error: 'An error occurred while saving your inquiry. Please try again or reach out on WhatsApp.' });
  }
});

// GET /api/cv (Download or view CV)
router.get('/cv', async (_req: Request, res: Response) => {
  try {
    const profileRow = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['profile_data']
    );

    if (profileRow) {
      const profile = JSON.parse(profileRow.setting_value);
      if (profile.cvUrl) {
        const filePath = path.resolve(process.cwd(), 'public', profile.cvUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          res.download(filePath, 'Sudip_Bhandari_CV.pdf');
          return;
        }
      }
    }

    res.status(404).json({ error: 'No CV has been uploaded yet. Please contact directly or check back soon.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to access CV' });
  }
});

/* ==========================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================== */

// POST /api/admin/login
router.post('/admin/login', checkLoginRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const admin = await get<{ id: number; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM admins WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!admin) {
      recordFailedLogin(ip);
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) {
      recordFailedLogin(ip);
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Success: reset rate limiter, update last_login_at, create session
    resetLoginAttempts(ip);
    await run('UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    const sessionToken = createSession(admin.id, admin.email);
    setSessionCookie(res, sessionToken);

    res.json({
      success: true,
      token: sessionToken,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login authentication error' });
  }
});

// POST /api/admin/logout
router.post('/admin/logout', (req: Request, res: Response) => {
  const token = req.cookies?.admin_session_token || req.headers.authorization?.replace('Bearer ', '');
  invalidateSession(token);
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/admin/me
router.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  const admin = (req as any).admin;
  res.json({
    authenticated: true,
    admin: {
      id: admin.id,
      email: admin.email
    }
  });
});

// POST /api/admin/change-password
router.post('/admin/change-password', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const adminRecord = await get<{ password_hash: string }>(
      'SELECT password_hash FROM admins WHERE id = ?',
      [admin.id]
    );

    if (!adminRecord || !(await bcrypt.compare(currentPassword, adminRecord.password_hash))) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await run('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      newHash,
      admin.id
    ]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

/* ==========================================
   ADMIN DASHBOARD OVERVIEW & PROJECTS
   ========================================== */

// GET /api/admin/overview
router.get('/admin/overview', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const publishedCount = await get<{ count: number }>(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'published'"
    );
    const draftCount = await get<{ count: number }>(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'draft'"
    );
    const totalInquiries = await get<{ count: number }>('SELECT COUNT(*) as count FROM inquiries');
    const newInquiries = await get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'"
    );

    const recentInquiries = await all(
      'SELECT id, full_name, email, service, status, created_at FROM inquiries ORDER BY id DESC LIMIT 5'
    );

    res.json({
      stats: {
        publishedProjects: publishedCount?.count || 0,
        draftProjects: draftCount?.count || 0,
        totalInquiries: totalInquiries?.count || 0,
        newInquiries: newInquiries?.count || 0
      },
      recentInquiries
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// GET /api/admin/projects (All projects including drafts)
router.get('/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search && search.trim().length > 0) {
      query += ' AND (title LIKE ? OR short_description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY id DESC';

    const projects = await all(query, params);
    const formatted = projects.map(p => ({
      ...p,
      tools: JSON.parse(p.tools_json || '[]'),
      featured: Boolean(p.featured)
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve admin projects' });
  }
});

// POST /api/admin/projects (Create new project)
router.post('/api/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      short_description,
      description,
      category,
      tools,
      cover_image_key,
      featured,
      status,
      client_name,
      project_url,
      case_study_url,
      project_objective,
      design_process,
      final_outcome
    } = req.body;

    if (!title || !slug || !category || !cover_image_key) {
      res.status(400).json({ error: 'Title, unique slug, category, and cover image are required.' });
      return;
    }

    const safeSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const existing = await get('SELECT id FROM projects WHERE slug = ?', [safeSlug]);
    if (existing) {
      res.status(400).json({ error: 'A project with this URL slug already exists.' });
      return;
    }

    const isPublished = status === 'published';
    const publishedAt = isPublished ? new Date().toISOString() : null;

    const result = await run(`
      INSERT INTO projects (
        title, slug, short_description, description, category, tools_json,
        cover_image_key, featured, status, client_name, project_url, case_study_url,
        project_objective, design_process, final_outcome, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    `, [
      title.trim(),
      safeSlug,
      short_description || '',
      description || '',
      category,
      JSON.stringify(Array.isArray(tools) ? tools : []),
      cover_image_key,
      featured ? 1 : 0,
      status || 'draft',
      client_name || null,
      project_url || null,
      case_study_url || null,
      project_objective || null,
      design_process || null,
      final_outcome || null,
      publishedAt
    ]);

    res.status(201).json({
      success: true,
      id: result.lastID,
      slug: safeSlug,
      message: 'Project created successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/admin/projects/:id
router.get('/api/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const images = await all('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC', [id]);
    res.json({
      ...project,
      tools: JSON.parse(project.tools_json || '[]'),
      featured: Boolean(project.featured),
      images
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// PUT /api/admin/projects/:id (Update project)
router.put('/api/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      short_description,
      description,
      category,
      tools,
      cover_image_key,
      featured,
      status,
      client_name,
      project_url,
      case_study_url,
      project_objective,
      design_process,
      final_outcome
    } = req.body;

    const existing = await get<{ id: number; status: string; published_at: string }>(
      'SELECT id, status, published_at FROM projects WHERE id = ?',
      [id]
    );

    if (!existing) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const safeSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const slugCheck = await get('SELECT id FROM projects WHERE slug = ? AND id != ?', [safeSlug, id]);
    if (slugCheck) {
      res.status(400).json({ error: 'Another project already uses this URL slug.' });
      return;
    }

    let publishedAt = existing.published_at;
    if (status === 'published' && !existing.published_at) {
      publishedAt = new Date().toISOString();
    }

    await run(`
      UPDATE projects SET
        title = ?, slug = ?, short_description = ?, description = ?,
        category = ?, tools_json = ?, cover_image_key = ?, featured = ?,
        status = ?, client_name = ?, project_url = ?, case_study_url = ?,
        project_objective = ?, design_process = ?, final_outcome = ?,
        updated_at = CURRENT_TIMESTAMP, published_at = ?
      WHERE id = ?
    `, [
      title.trim(),
      safeSlug,
      short_description || '',
      description || '',
      category,
      JSON.stringify(Array.isArray(tools) ? tools : []),
      cover_image_key,
      featured ? 1 : 0,
      status || 'draft',
      client_name || null,
      project_url || null,
      case_study_url || null,
      project_objective || null,
      design_process || null,
      final_outcome || null,
      publishedAt,
      id
    ]);

    res.json({ success: true, message: 'Project updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/admin/projects/:id (Delete project)
router.delete('/api/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM project_images WHERE project_id = ?', [id]);
    await run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/admin/uploads (Image upload handler)
router.post('/admin/uploads', requireAdminAuth, uploadImage.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded.' });
    return;
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileKey: publicUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

/* ==========================================
   ADMIN INQUIRIES MANAGEMENT
   ========================================== */

// GET /api/admin/inquiries
router.get('/admin/inquiries', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = `
      SELECT i.*, 
             e.status as email_status, 
             e.provider as email_provider, 
             e.error_summary as email_error
      FROM inquiries i
      LEFT JOIN email_notifications e ON e.inquiry_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (search && search.trim().length > 0) {
      query += ' AND (i.full_name LIKE ? OR i.email LIKE ? OR i.company LIKE ? OR i.message LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY i.id DESC';

    const inquiries = await all(query, params);
    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load inquiries' });
  }
});

// GET /api/admin/inquiries/:id
router.get('/admin/inquiries/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await get(`
      SELECT i.*, 
             e.status as email_status, 
             e.provider as email_provider, 
             e.error_summary as email_error,
             e.attempt_count as email_attempts,
             e.last_attempt_at as email_last_attempt
      FROM inquiries i
      LEFT JOIN email_notifications e ON e.inquiry_id = i.id
      WHERE i.id = ?
    `, [id]);

    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    res.json(inquiry);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get inquiry' });
  }
});

// PATCH /api/admin/inquiries/:id (Update inquiry status or admin notes)
router.patch('/admin/inquiries/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['new', 'contacted', 'in_progress', 'completed', 'archived'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid inquiry status.' });
      return;
    }

    await run(`
      UPDATE inquiries SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status || null, admin_notes !== undefined ? admin_notes : null, id]);

    res.json({ success: true, message: 'Inquiry updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// POST /api/admin/inquiries/:id/retry-email
router.post('/admin/inquiries/:id/retry-email', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await get('SELECT * FROM inquiries WHERE id = ?', [id]);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    const result = await sendInquiryNotification(inquiry);
    res.json({
      success: result.success,
      status: result.status,
      provider: result.provider,
      errorSummary: result.errorSummary
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retry notification' });
  }
});

// DELETE /api/admin/inquiries/:id
router.delete('/admin/inquiries/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM email_notifications WHERE inquiry_id = ?', [id]);
    await run('DELETE FROM inquiries WHERE id = ?', [id]);
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

/* ==========================================
   ADMIN SETTINGS & CV MANAGEMENT
   ========================================== */

// GET /api/admin/settings
router.get('/admin/settings', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const profileRow = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['profile_data']
    );
    const servicesRow = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['services_data']
    );

    res.json({
      profile: profileRow ? JSON.parse(profileRow.setting_value) : null,
      services: servicesRow ? JSON.parse(servicesRow.setting_value) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// PUT /api/admin/settings
router.put('/admin/settings', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { profile, services } = req.body;

    if (profile) {
      await run(`
        INSERT INTO site_settings (setting_key, setting_value, updated_at)
        VALUES ('profile_data', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(profile)]);
    }

    if (services && Array.isArray(services)) {
      await run(`
        INSERT INTO site_settings (setting_key, setting_value, updated_at)
        VALUES ('services_data', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(services)]);
    }

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// POST /api/admin/upload-cv
router.post('/admin/upload-cv', requireAdminAuth, uploadCV.single('cv'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file was uploaded.' });
      return;
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    // Update profile_data with new CV URL
    const profileRow = await get<{ setting_value: string }>(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['profile_data']
    );

    if (profileRow) {
      const profile = JSON.parse(profileRow.setting_value);
      profile.cvUrl = publicUrl;
      await run(
        'UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [JSON.stringify(profile), 'profile_data']
      );
    }

    res.json({
      success: true,
      cvUrl: publicUrl,
      message: 'CV uploaded and updated successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload CV' });
  }
});

// GET /api/export-project - Download complete project source code (.zip)
router.get('/export-project', async (_req: Request, res: Response) => {
  try {
    const zipPath = path.resolve(process.cwd(), 'public', 'downloads', 'sudip-portfolio-source.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="sudip-bhandari-portfolio-source.zip"');
      return res.sendFile(zipPath);
    }
    return res.status(404).json({ error: 'Zip archive not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to export project archive' });
  }
});

export default router;
