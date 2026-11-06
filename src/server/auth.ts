import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { get, run } from './db';

// Persistent session store mapped to admin details
interface AdminSession {
  adminId: number;
  email: string;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const sessions = new Map<string, AdminSession>();

function loadSessionsFromDisk() {
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      const now = Date.now();
      for (const [token, sess] of Object.entries(data)) {
        if ((sess as AdminSession).expiresAt > now) {
          sessions.set(token, sess as AdminSession);
        }
      }
    } catch (e) {
      console.error('Failed to parse sessions.json:', e);
    }
  }
}

function saveSessionsToDisk() {
  try {
    const obj: Record<string, AdminSession> = {};
    for (const [token, sess] of sessions.entries()) {
      obj[token] = sess;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write sessions.json:', err);
  }
}

loadSessionsFromDisk();

// Rate limiting store
interface RateLimitEntry {
  attempts: number;
  blockedUntil?: number;
}
const loginRateLimit = new Map<string, RateLimitEntry>();
const contactRateLimit = new Map<string, RateLimitEntry>();

const SESSION_COOKIE_NAME = 'admin_session_token';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createSession(adminId: number, email: string): string {
  const token = generateSessionToken();
  sessions.set(token, {
    adminId,
    email,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  saveSessionsToDisk();
  return token;
}

export function getSession(token?: string): AdminSession | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    saveSessionsToDisk();
    return null;
  }
  return session;
}

export function invalidateSession(token?: string): void {
  if (token) {
    sessions.delete(token);
    saveSessionsToDisk();
  }
}

// Cookie helper
export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/'
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
}

// Extract token from request (Cookies, Authorization header, or custom header)
export function extractToken(req: Request): string | undefined {
  if (req.cookies?.[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const match = authHeader.match(/^bearer\s+(.+)$/i);
    if (match) {
      return match[1].trim();
    }
  }
  const customHeader = req.headers['x-admin-token'];
  if (typeof customHeader === 'string') {
    return customHeader.trim();
  }
  return undefined;
}

// Authentication Middleware
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  const session = getSession(token);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    return;
  }

  // Verify admin still exists in database
  const admin = await get('SELECT id, email FROM admins WHERE id = ?', [session.adminId]);
  if (!admin) {
    invalidateSession(token);
    res.status(401).json({ error: 'Unauthorized: Account not found.' });
    return;
  }

  (req as any).admin = admin;
  next();
}

// Rate Limiting Middlewares
export function checkLoginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = loginRateLimit.get(ip);

  if (entry && entry.blockedUntil && now < entry.blockedUntil) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    res.status(429).json({
      error: `Too many login attempts. Please try again in ${remainingSeconds} seconds.`
    });
    return;
  }

  next();
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginRateLimit.get(ip) || { attempts: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000;
  }

  loginRateLimit.set(ip, entry);
}

export function resetLoginAttempts(ip: string): void {
  loginRateLimit.delete(ip);
}

// Contact form rate limiting (prevent automated floods)
export function checkContactRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = contactRateLimit.get(ip);

  if (entry && entry.attempts >= 8 && entry.blockedUntil && now < entry.blockedUntil) {
    res.status(429).json({
      error: 'You have submitted several inquiries recently. Please contact directly via WhatsApp or email.'
    });
    return;
  }

  if (!entry || (entry.blockedUntil && now >= entry.blockedUntil)) {
    contactRateLimit.set(ip, { attempts: 1, blockedUntil: now + 10 * 60 * 1000 });
  } else {
    entry.attempts += 1;
    if (entry.attempts >= 8) {
      entry.blockedUntil = now + 10 * 60 * 1000;
    }
    contactRateLimit.set(ip, entry);
  }

  next();
}
