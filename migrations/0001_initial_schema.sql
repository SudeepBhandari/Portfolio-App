-- 0001_initial_schema.sql: Cloudflare D1 / SQLite Database Schema for Sudip Bhandari Portfolio

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tools_json TEXT NOT NULL DEFAULT '[]',
  cover_image_key TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  client_name TEXT,
  project_url TEXT,
  case_study_url TEXT,
  project_objective TEXT,
  design_process TEXT,
  final_outcome TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_key TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  preferred_contact TEXT DEFAULT 'Email',
  reference_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  error_summary TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_inquiry ON email_notifications(inquiry_id);
