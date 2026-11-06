import React from 'react';
import {
  Cloud,
  Globe,
  Database,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ExternalLink,
  AlertTriangle,
  Download
} from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  return (
    <div className="space-y-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <Cloud className="w-6 h-6 text-amber-500" />
          <span>Production Deployment & Cloudflare Guide</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete step-by-step instructions for deploying to Cloudflare Pages/Workers, running Cloudflare D1 migrations, connecting custom domain <strong className="text-stone-800 dark:text-stone-200">www.sudipbhandari5.com.np</strong>, and configuring zero-cost services.
        </p>
      </div>

      {/* Target Domain Info Card */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
          <Globe className="w-4 h-4 text-amber-600" />
          <span>Verified Target Domain: https://www.sudipbhandari5.com.np</span>
        </div>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Both the <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">www.sudipbhandari5.com.np</code> subdomain and the apex domain <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">sudipbhandari5.com.np</code> can be linked in Cloudflare with automatic SSL certification and apex-to-www redirection.
        </p>
      </div>

      {/* Direct Source Code Download (.ZIP) & Local Setup */}
      <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-base text-stone-900 dark:text-stone-100">
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Download Complete Project Source Code (.ZIP)</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Get the entire project packaged into a single ready-to-run ZIP archive (~4.8MB).
            </p>
          </div>

          <a
            href="/downloads/sudip-portfolio-source.zip"
            download="sudip-bhandari-portfolio.zip"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download All Files (.ZIP)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
          <div className="p-3 bg-white/80 dark:bg-[#121215]/80 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1">
            <div className="font-bold text-stone-900 dark:text-stone-100">1. Unzip the File</div>
            <p className="text-stone-500">Double-click or run <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">unzip sudip-portfolio.zip</code>.</p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-[#121215]/80 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1">
            <div className="font-bold text-stone-900 dark:text-stone-100">2. Install Dependencies</div>
            <p className="text-stone-500">Open terminal in the folder and run <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">npm install</code>.</p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-[#121215]/80 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1">
            <div className="font-bold text-stone-900 dark:text-stone-100">3. Run Locally</div>
            <p className="text-stone-500">Run <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">npm run dev</code> and open <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">http://localhost:3000</code>.</p>
          </div>
        </div>
      </div>

      {/* Phase 1: GitHub & Cloudflare Deployment */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Terminal className="w-4 h-4 text-stone-500" />
          <span>Step 1: Push Code to GitHub</span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Initialize git in your workspace root, commit the source files, and push to your private or public GitHub repository.
        </p>

        <div className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs space-y-1">
          <p className="text-stone-400"># In workspace root</p>
          <p>git init</p>
          <p>git add .</p>
          <p>git commit -m "feat: complete portfolio & admin platform for Sudip Bhandari"</p>
          <p>git branch -M main</p>
          <p>git remote add origin https://github.com/YOUR_USERNAME/sudip-portfolio.git</p>
          <p>git push -u origin main</p>
        </div>
      </div>

      {/* Phase 2: Cloudflare D1 Database Provisioning */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Database className="w-4 h-4 text-stone-500" />
          <span>Step 2: Create Cloudflare D1 Database & Run Migrations</span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Cloudflare D1 provides a serverless relational database running SQLite at the edge with a generous free plan (5 million reads / 100k writes daily at $0).
        </p>

        <div className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs space-y-1">
          <p className="text-stone-400"># 1. Login to Cloudflare Wrangler CLI</p>
          <p>npx wrangler login</p>
          <p className="text-stone-400 mt-2"># 2. Create the production D1 database</p>
          <p>npx wrangler d1 create sudip-portfolio-db</p>
          <p className="text-stone-400 mt-2"># 3. Apply the initial schema migration</p>
          <p>npx wrangler d1 execute sudip-portfolio-db --file=./migrations/0001_initial_schema.sql</p>
        </div>
      </div>

      {/* Phase 3: Cloudflare Pages / Workers Setup */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Cloud className="w-4 h-4 text-stone-500" />
          <span>Step 3: Connect Cloudflare Pages</span>
        </div>

        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
          <p>
            1. Open the <strong>Cloudflare Dashboard</strong> &gt; <strong>Workers & Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong>.
          </p>
          <p>
            2. Select your GitHub repository.
          </p>
          <p>
            3. Build settings:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
            <li>Framework preset: Vite</li>
            <li>Build command: npm run build</li>
            <li>Build output directory: dist</li>
          </ul>
        </div>
      </div>

      {/* Phase 4: Custom Domain & DNS Records */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Globe className="w-4 h-4 text-stone-500" />
          <span>Step 4: Connect Domain: www.sudipbhandari5.com.np</span>
        </div>

        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
          <p>
            In your Cloudflare Pages project settings:
          </p>
          <p>
            1. Go to <strong>Custom domains</strong> &gt; <strong>Set up a domain</strong>.
          </p>
          <p>
            2. Enter: <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">www.sudipbhandari5.com.np</code>.
          </p>
          <p>
            3. Add DNS records at your registrar or in Cloudflare DNS:
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left font-mono text-[11px] border border-stone-200 dark:border-stone-800 rounded-lg">
              <thead className="bg-stone-50 dark:bg-stone-900 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-2">Type</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Target / Content</th>
                  <th className="p-2">Proxy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                <tr>
                  <td className="p-2">CNAME</td>
                  <td className="p-2">www</td>
                  <td className="p-2">&lt;your-project&gt;.pages.dev</td>
                  <td className="p-2">Proxied (Orange)</td>
                </tr>
                <tr>
                  <td className="p-2">CNAME / Redirect</td>
                  <td className="p-2">@ (apex)</td>
                  <td className="p-2">Redirect to www.sudipbhandari5.com.np</td>
                  <td className="p-2">Proxied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Phase 5: Transactional Email Setup */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Mail className="w-4 h-4 text-stone-500" />
          <span>Step 5: Optional Transactional Email (Resend Free Allowance)</span>
        </div>

        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
          <p>
            To receive instant email notifications whenever someone submits the contact form:
          </p>
          <p>
            1. Create a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline">resend.com</a> (3,000 free emails/month).
          </p>
          <p>
            2. Generate an API Key under <strong>API Keys</strong>.
          </p>
          <p>
            3. Set environment variables in Cloudflare Pages dashboard:
          </p>
          <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-lg font-mono text-[11px] space-y-1">
            <p>EMAIL_PROVIDER="resend"</p>
            <p>RESEND_API_KEY="re_123456789..."</p>
            <p>ADMIN_EMAIL="bhandarysudip5@gmail.com"</p>
          </div>
          <p className="text-[11px] text-stone-500">
            * Note: If left unconfigured, inquiries are always preserved safely in your SQLite / D1 database and can be reviewed at any time directly in this admin dashboard!
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-6 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pre-Launch Security Checklist</span>
        </h3>
        <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Admin password changed from default temporary password</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>HTTPS enabled automatically via Cloudflare Universal SSL</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Spam honeypot and rate limiting verified on /api/inquiries</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Private admin routes protected with HttpOnly cookies & server-side auth</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
