# Sudip Bhandari – Personal Portfolio & Admin Platform

A premium, modern, responsive personal portfolio website and full-stack management system built for **Sudip Bhandari**, Creative Graphic Designer & Digital Marketer.

- **Website Domain**: [https://www.sudipbhandari5.com.np](https://www.sudipbhandari5.com.np)
- **Primary Email**: [bhandarysudip5@gmail.com](mailto:bhandarysudip5@gmail.com)
- **WhatsApp**: [+977 9840631570](https://wa.me/9779840631570)
- **Admin Portal**: `/admin` (Login: `/admin/login`)

---

## 1. Features & Architectural Overview

### Public Website
- **Hero Split**: High-impact editorial typographic layout paired with studio workspace visuals and dual CTAs ("Hire Me" and "Explore My Work").
- **Portfolio Gallery (`/projects`)**: Complete project showcase with real-time category filtering (Branding, UI/UX, Social Media, Graphic Design, Video Editing, Digital Marketing), keyword search, and responsive grid.
- **Project Case Studies (`/projects/:slug`)**: Dedicated URLs with background narrative, objectives, design process, final deliverables, interactive high-res image lightbox, and related works.
- **Services Page (`/services`)**: Comprehensive breakdown of 7 core disciplines with key deliverables, optional starting rates, and 1-click inquiry prefilling.
- **About Page (`/about`)**: Verified biography, creative philosophy, core competencies, and direct contact channels.
- **Resume Page (`/resume`)**: Download CV button, embedded PDF viewer, and interactive resume breakdown with fallback messaging if no PDF has been uploaded yet.
- **Contact System (`/contact`)**: Client and server validated Hire Me form, anti-spam honeypot, rate limiting, instant WhatsApp continuation, and database persistence.
- **Floating WhatsApp**: Accessible floating action button opening WhatsApp Web/mobile with URL-encoded custom or service-specific messages.
- **Dual-Theme Support**: Dark and light modes with system preference auto-detection and persistent `localStorage` retention.
- **SEO & Social Cards**: Semantic HTML, OpenGraph tags, Twitter cards, Schema.org JSON-LD structured data, `robots.txt`, and `sitemap.xml`.

### Secure Admin Dashboard (`/admin`)
- **Authentication**: Salted password hashing with `bcryptjs`, secure HttpOnly SameSite session cookies, and login rate limiting.
- **Project CRUD**: Create, edit, publish, draft, feature, search, and delete portfolio projects.
- **Media Uploads**: Built-in image upload with file type/size validation and thumbnail previews.
- **Inquiry Management**: View, search, filter by status (New, Contacted, In Progress, Completed, Archived), write private notes, and trigger email notification retries.
- **Profile & Settings**: Edit public biography, hero text, skills, services, and upload a new PDF CV.
- **Cloudflare Deployment Guide**: In-dashboard documentation for edge deployment, D1 migrations, R2 buckets, and DNS configuration.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, React Router v7.
- **Backend**: Node.js Express server running with Vite middleware in development and static asset serving in production (`server.ts`).
- **Database & Storage**:
  - Development / Self-Hosted: Persistent file-backed relational store (`data/portfolio_store.json`) with zero native C++ compile dependencies.
  - Production Cloudflare: Cloudflare D1 SQL schema and migration (`migrations/0001_initial_schema.sql`).
  - Media: Uploads directory (`public/uploads`) or Cloudflare R2 bucket.

---

## 3. Administrator Access Guide

When the platform first starts, the database provisions the initial administrator:
- **Admin Account**: `[Protected / Configured during setup]`
- **Password**: `••••••••••••••`

*Note: You can change or update your credentials at any time under **Admin Portal > Profile & Settings**.*

---

## 4. Production Deployment to Cloudflare & Custom Domain

### Step 1: Deploy to Cloudflare Pages
1. Push repository to GitHub.
2. Go to **Cloudflare Dashboard > Workers & Pages > Create application > Pages > Connect to Git**.
3. Select your repository.
4. Framework preset: **Vite**, Build command: `npm run build`, Output directory: `dist`.

### Step 2: Cloudflare D1 Database Setup
Run the migration via Wrangler CLI:
```bash
npx wrangler d1 create sudip-portfolio-db
npx wrangler d1 execute sudip-portfolio-db --file=./migrations/0001_initial_schema.sql
```

### Step 3: Connect Custom Domain (www.sudipbhandari5.com.np)
1. In Cloudflare Pages, navigate to **Custom domains > Set up a domain**.
2. Enter: `www.sudipbhandari5.com.np`.
3. Add the CNAME DNS record pointing to your `*.pages.dev` domain with proxy enabled (Orange Cloud).
4. For the apex domain `sudipbhandari5.com.np`, configure a 301 redirect rule to `https://www.sudipbhandari5.com.np`.

### Step 4: Optional Transactional Email (Resend)
1. Sign up for a free account at [resend.com](https://resend.com) (3,000 free emails/month).
2. Set environment variables:
   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_EMAIL=bhandarysudip5@gmail.com
   ```
*If not configured, all inquiries are permanently preserved in the database for review in the admin dashboard.*
