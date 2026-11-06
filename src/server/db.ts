import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'portfolio_store.json');

interface DatabaseStore {
  admins: any[];
  projects: any[];
  project_images: any[];
  inquiries: any[];
  site_settings: any[];
  email_notifications: any[];
  sequences: {
    admins: number;
    projects: number;
    project_images: number;
    inquiries: number;
    site_settings: number;
    email_notifications: number;
  };
}

let store: DatabaseStore = {
  admins: [],
  projects: [],
  project_images: [],
  inquiries: [],
  site_settings: [],
  email_notifications: [],
  sequences: {
    admins: 1,
    projects: 1,
    project_images: 1,
    inquiries: 1,
    site_settings: 1,
    email_notifications: 1
  }
};

function loadStore() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      store = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse database file, reinitializing', e);
    }
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store to file:', err);
  }
}

loadStore();

export async function run(query: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const q = query.trim();

  // Handle INSERT INTO
  if (/^INSERT INTO\s+(\w+)/i.test(q)) {
    const match = q.match(/^INSERT INTO\s+(\w+)/i);
    const table = match ? (match[1].toLowerCase() as keyof DatabaseStore) : null;
    if (table && Array.isArray((store as any)[table])) {
      const nextId = (store.sequences as any)[table]++;

      if (table === 'inquiries') {
        // [full_name, email, company, service, message, budget, deadline, preferred_contact, reference_url]
        const [full_name, email, company, service, message, budget, deadline, preferred_contact, reference_url] = params;
        const now = new Date().toISOString();
        const record = {
          id: nextId,
          full_name,
          email,
          company: company || null,
          service,
          message,
          budget: budget || null,
          deadline: deadline || null,
          preferred_contact: preferred_contact || 'Email',
          reference_url: reference_url || null,
          status: 'new',
          admin_notes: null,
          created_at: now,
          updated_at: now
        };
        store.inquiries.push(record);
        saveStore();
        return { lastID: nextId, changes: 1 };
      }

      if (table === 'projects') {
        const [
          title, slug, short_description, description, category, tools_json,
          cover_image_key, featured, status, client_name, project_url, case_study_url,
          project_objective, design_process, final_outcome, published_at
        ] = params;
        const now = new Date().toISOString();
        const record = {
          id: nextId,
          title,
          slug,
          short_description,
          description,
          category,
          tools_json: typeof tools_json === 'string' ? tools_json : JSON.stringify(tools_json || []),
          cover_image_key,
          featured: featured ? 1 : 0,
          status: status || 'draft',
          client_name: client_name || null,
          project_url: project_url || null,
          case_study_url: case_study_url || null,
          project_objective: project_objective || null,
          design_process: design_process || null,
          final_outcome: final_outcome || null,
          created_at: now,
          updated_at: now,
          published_at: published_at || (status === 'published' ? now : null)
        };
        store.projects.push(record);
        saveStore();
        return { lastID: nextId, changes: 1 };
      }

      if (table === 'site_settings') {
        const [setting_key, setting_value] = params;
        const now = new Date().toISOString();
        const existingIdx = store.site_settings.findIndex(s => s.setting_key === setting_key);
        if (existingIdx >= 0) {
          store.site_settings[existingIdx].setting_value = setting_value;
          store.site_settings[existingIdx].updated_at = now;
          saveStore();
          return { lastID: store.site_settings[existingIdx].id, changes: 1 };
        }
        const record = {
          id: nextId,
          setting_key,
          setting_value,
          updated_at: now
        };
        store.site_settings.push(record);
        saveStore();
        return { lastID: nextId, changes: 1 };
      }

      if (table === 'email_notifications') {
        const [inquiry_id, provider, status, error_summary] = params;
        const now = new Date().toISOString();
        const record = {
          id: nextId,
          inquiry_id,
          provider,
          status,
          error_summary,
          attempt_count: 1,
          last_attempt_at: now,
          created_at: now
        };
        store.email_notifications.push(record);
        saveStore();
        return { lastID: nextId, changes: 1 };
      }

      if (table === 'admins') {
        const [email, password_hash] = params;
        const now = new Date().toISOString();
        const record = {
          id: nextId,
          email,
          password_hash,
          created_at: now,
          updated_at: now,
          last_login_at: null
        };
        store.admins.push(record);
        saveStore();
        return { lastID: nextId, changes: 1 };
      }
    }
  }

  // Handle UPDATE
  if (/^UPDATE\s+(\w+)/i.test(q)) {
    const match = q.match(/^UPDATE\s+(\w+)/i);
    const table = match ? match[1].toLowerCase() : '';
    const now = new Date().toISOString();

    if (table === 'admins') {
      if (q.includes('last_login_at')) {
        const [adminId] = params;
        const admin = store.admins.find(a => a.id === Number(adminId));
        if (admin) {
          admin.last_login_at = now;
          saveStore();
          return { lastID: admin.id, changes: 1 };
        }
      }
      if (q.includes('password_hash')) {
        const [newHash, adminId] = params;
        const admin = store.admins.find(a => a.id === Number(adminId));
        if (admin) {
          admin.password_hash = newHash;
          admin.updated_at = now;
          saveStore();
          return { lastID: admin.id, changes: 1 };
        }
      }
    }

    if (table === 'inquiries') {
      const [status, admin_notes, id] = params;
      const inquiry = store.inquiries.find(i => i.id === Number(id));
      if (inquiry) {
        if (status !== null) inquiry.status = status;
        if (admin_notes !== null) inquiry.admin_notes = admin_notes;
        inquiry.updated_at = now;
        saveStore();
        return { lastID: inquiry.id, changes: 1 };
      }
    }

    if (table === 'projects') {
      const [
        title, slug, short_description, description, category, tools_json,
        cover_image_key, featured, status, client_name, project_url, case_study_url,
        project_objective, design_process, final_outcome, published_at, id
      ] = params;

      const project = store.projects.find(p => p.id === Number(id));
      if (project) {
        project.title = title;
        project.slug = slug;
        project.short_description = short_description;
        project.description = description;
        project.category = category;
        project.tools_json = typeof tools_json === 'string' ? tools_json : JSON.stringify(tools_json || []);
        project.cover_image_key = cover_image_key;
        project.featured = featured ? 1 : 0;
        project.status = status;
        project.client_name = client_name;
        project.project_url = project_url;
        project.case_study_url = case_study_url;
        project.project_objective = project_objective;
        project.design_process = design_process;
        project.final_outcome = final_outcome;
        project.updated_at = now;
        project.published_at = published_at;
        saveStore();
        return { lastID: project.id, changes: 1 };
      }
    }

    if (table === 'site_settings') {
      const [setting_value, setting_key] = params;
      const setting = store.site_settings.find(s => s.setting_key === setting_key);
      if (setting) {
        setting.setting_value = setting_value;
        setting.updated_at = now;
        saveStore();
        return { lastID: setting.id, changes: 1 };
      }
    }

    if (table === 'email_notifications') {
      const [provider, status, error_summary, id] = params;
      const notif = store.email_notifications.find(n => n.id === Number(id));
      if (notif) {
        notif.provider = provider;
        notif.status = status;
        notif.error_summary = error_summary;
        notif.attempt_count += 1;
        notif.last_attempt_at = now;
        saveStore();
        return { lastID: notif.id, changes: 1 };
      }
    }
  }

  // Handle DELETE
  if (/^DELETE FROM\s+(\w+)/i.test(q)) {
    const match = q.match(/^DELETE FROM\s+(\w+)/i);
    const table = match ? match[1].toLowerCase() : '';
    const id = params[0];

    if (table === 'projects') {
      const initial = store.projects.length;
      store.projects = store.projects.filter(p => p.id !== Number(id));
      store.project_images = store.project_images.filter(img => img.project_id !== Number(id));
      saveStore();
      return { lastID: 0, changes: initial - store.projects.length };
    }

    if (table === 'inquiries') {
      const initial = store.inquiries.length;
      store.inquiries = store.inquiries.filter(i => i.id !== Number(id));
      store.email_notifications = store.email_notifications.filter(e => e.inquiry_id !== Number(id));
      saveStore();
      return { lastID: 0, changes: initial - store.inquiries.length };
    }

    if (table === 'project_images') {
      store.project_images = store.project_images.filter(img => img.project_id !== Number(id));
      saveStore();
      return { lastID: 0, changes: 1 };
    }

    if (table === 'email_notifications') {
      store.email_notifications = store.email_notifications.filter(e => e.inquiry_id !== Number(id));
      saveStore();
      return { lastID: 0, changes: 1 };
    }
  }

  return { lastID: 0, changes: 0 };
}

export async function get<T = any>(query: string, params: any[] = []): Promise<T | undefined> {
  const rows = await all<T>(query, params);
  return rows[0];
}

export async function all<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const q = query.trim();

  // SELECT COUNT(*)
  if (/SELECT COUNT\(\*\)\s+as\s+count\s+FROM\s+(\w+)/i.test(q)) {
    const match = q.match(/FROM\s+(\w+)/i);
    const table = match ? match[1].toLowerCase() : '';
    let items: any[] = (store as any)[table] || [];

    if (q.includes("status = 'published'")) {
      items = items.filter(i => i.status === 'published');
    } else if (q.includes("status = 'draft'")) {
      items = items.filter(i => i.status === 'draft');
    } else if (q.includes("status = 'new'")) {
      items = items.filter(i => i.status === 'new');
    }
    return [{ count: items.length } as any];
  }

  // SELECT from site_settings
  if (/FROM\s+site_settings/i.test(q)) {
    const key = params[0];
    const item = store.site_settings.find(s => s.setting_key === key);
    return item ? [item as any] : [];
  }

  // SELECT from admins
  if (/FROM\s+admins/i.test(q)) {
    if (q.includes('email = ?')) {
      const email = params[0]?.toLowerCase();
      const admin = store.admins.find(a => a.email.toLowerCase() === email);
      return admin ? [admin as any] : [];
    }
    if (q.includes('id = ?')) {
      const id = Number(params[0]);
      const admin = store.admins.find(a => a.id === id);
      return admin ? [admin as any] : [];
    }
    return store.admins as any;
  }

  // SELECT from projects
  if (/FROM\s+projects/i.test(q)) {
    let list = [...store.projects];

    if (q.includes('slug = ?')) {
      const slug = params[0];
      const proj = list.find(p => p.slug === slug);
      return proj ? [proj as any] : [];
    }

    if (q.includes('id = ?')) {
      const id = Number(params[0]);
      const proj = list.find(p => p.id === id);
      return proj ? [proj as any] : [];
    }

    if (q.includes("status = 'published'")) {
      list = list.filter(p => p.status === 'published');
    }

    if (q.includes('category = ?')) {
      const categoryIdx = params.findIndex(p => typeof p === 'string' && !p.startsWith('%'));
      if (categoryIdx >= 0) {
        list = list.filter(p => p.category === params[categoryIdx]);
      }
    }

    if (q.includes('status = ?')) {
      const statusParam = params.find(p => p === 'published' || p === 'draft');
      if (statusParam) {
        list = list.filter(p => p.status === statusParam);
      }
    }

    if (q.includes('LIKE ?')) {
      const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%'))?.replace(/%/g, '').toLowerCase();
      if (searchParam) {
        list = list.filter(p =>
          (p.title && p.title.toLowerCase().includes(searchParam)) ||
          (p.short_description && p.short_description.toLowerCase().includes(searchParam)) ||
          (p.category && p.category.toLowerCase().includes(searchParam))
        );
      }
    }

    if (q.includes('ORDER BY featured DESC')) {
      list.sort((a, b) => (b.featured || 0) - (a.featured || 0) || b.id - a.id);
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    if (q.includes('LIMIT')) {
      const limitMatch = q.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        list = list.slice(0, parseInt(limitMatch[1], 10));
      }
    }

    return list as any;
  }

  // SELECT from project_images
  if (/FROM\s+project_images/i.test(q)) {
    const projId = Number(params[0]);
    return store.project_images.filter(img => img.project_id === projId) as any;
  }

  // SELECT from inquiries
  if (/FROM\s+inquiries/i.test(q)) {
    if (q.includes('WHERE i.id = ?') || q.includes('WHERE id = ?')) {
      const id = Number(params[0]);
      const inq = store.inquiries.find(i => i.id === id);
      if (!inq) return [];
      const notif = store.email_notifications.find(e => e.inquiry_id === id);
      return [{
        ...inq,
        email_status: notif?.status,
        email_provider: notif?.provider,
        email_error: notif?.error_summary,
        email_attempts: notif?.attempt_count,
        email_last_attempt: notif?.last_attempt_at
      } as any];
    }

    let list = store.inquiries.map(inq => {
      const notif = store.email_notifications.find(e => e.inquiry_id === inq.id);
      return {
        ...inq,
        email_status: notif?.status,
        email_provider: notif?.provider,
        email_error: notif?.error_summary
      };
    });

    if (q.includes('i.status = ?')) {
      const statusParam = params.find(p => ['new', 'contacted', 'in_progress', 'completed', 'archived'].includes(p));
      if (statusParam) {
        list = list.filter(i => i.status === statusParam);
      }
    }

    if (q.includes('LIKE ?')) {
      const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%'))?.replace(/%/g, '').toLowerCase();
      if (searchParam) {
        list = list.filter(i =>
          (i.full_name && i.full_name.toLowerCase().includes(searchParam)) ||
          (i.email && i.email.toLowerCase().includes(searchParam)) ||
          (i.company && i.company.toLowerCase().includes(searchParam)) ||
          (i.message && i.message.toLowerCase().includes(searchParam))
        );
      }
    }

    list.sort((a, b) => b.id - a.id);

    if (q.includes('LIMIT')) {
      const limitMatch = q.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        list = list.slice(0, parseInt(limitMatch[1], 10));
      }
    }

    return list as any;
  }

  // SELECT from email_notifications
  if (/FROM\s+email_notifications/i.test(q)) {
    const inqId = Number(params[0]);
    return store.email_notifications.filter(e => e.inquiry_id === inqId) as any;
  }

  return [];
}

export async function initDatabase(): Promise<void> {
  loadStore();

  // Seed default site settings if empty
  const profileSetting = await get('SELECT * FROM site_settings WHERE setting_key = ?', ['profile_data']);
  if (!profileSetting) {
    const defaultProfile = {
      fullName: 'Sudip Bhandari',
      professionalTitle: 'Creative Graphic Designer & Digital Marketer',
      websiteDomain: 'https://www.sudipbhandari5.com.np',
      primaryEmail: 'bhandarysudip5@gmail.com',
      whatsAppNumber: '+9779840631570',
      whatsAppLink: 'https://wa.me/9779840631570',
      avatarUrl: '/assets/aistudio/sudip_3f6de287.jpeg',
      heroHeading: 'Creative Design. Meaningful Digital Experiences.',
      heroSubheading: 'I help brands communicate through thoughtful design, engaging digital experiences, and creative marketing solutions.',
      bio: 'I am a creative professional focused on graphic design, UI/UX design, branding, video editing, and digital marketing. I create thoughtful visual experiences and digital solutions that help brands communicate effectively and stand out.',
      approach: 'Every project begins with deep listening and understanding the core brand intent. I combine disciplined typography, spatial hierarchy, and visual balance with conversion-focused digital marketing strategy.',
      goals: 'To collaborate with ambitious businesses and founders to craft memorable brand identities, intuitive digital products, and high-converting marketing campaigns.',
      skills: [
        'Graphic Design',
        'UI/UX Design',
        'Branding & Visual Identity',
        'Social Media Campaign Design',
        'Video Editing & Motion Graphics',
        'Digital Marketing Strategy',
        'Website Design',
        'Typography & Layout Systems'
      ],
      socialLinks: {
        linkedin: '',
        instagram: '',
        behance: '',
        dribbble: '',
        twitter: ''
      },
      cvUrl: ''
    };

    await run('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [
      'profile_data',
      JSON.stringify(defaultProfile)
    ]);
  }

  // Seed default services if empty
  const servicesSetting = await get('SELECT * FROM site_settings WHERE setting_key = ?', ['services_data']);
  if (!servicesSetting) {
    const defaultServices = [
      {
        id: 'graphic-design',
        title: 'Graphic Design',
        description: 'Compelling visual communication and print & digital design crafted to convey your brand voice with clarity and distinction.',
        deliverables: ['Print & Digital Collateral', 'Posters, Banners & Editorial Layouts', 'Vector Illustrations', 'Production-ready Source Files'],
        startingPrice: '$150'
      },
      {
        id: 'ui-ux-design',
        title: 'UI/UX Design',
        description: 'Intuitive, aesthetically refined digital product interfaces designed for optimal user clarity, usability, and modern elegance.',
        deliverables: ['Mobile App & Web App UI', 'Design Systems & Component Libraries', 'Figma Clickable Interactive Prototypes', 'Developer Handoff Specifications'],
        startingPrice: '$350'
      },
      {
        id: 'branding-identity',
        title: 'Branding and Brand Identity',
        description: 'Complete visual identity systems that forge an unforgettable connection with your target audience across all physical and digital touchpoints.',
        deliverables: ['Logo System & Variations', 'Brand Guidelines Manual', 'Color Palette & Typography System', 'Stationery & Social Media Kit'],
        startingPrice: '$400'
      },
      {
        id: 'social-media-design',
        title: 'Social Media Design',
        description: 'Eye-catching social media graphics and multi-slide carousels engineered for high engagement and strong visual retention.',
        deliverables: ['Campaign Concept & Creative Direction', 'Instagram / LinkedIn Carousels', 'Promotional Banners & Story Templates', 'Platform-optimized Asset Delivery'],
        startingPrice: '$120'
      },
      {
        id: 'video-editing',
        title: 'Video Editing',
        description: 'Dynamic pacing, cinematic cuts, color grading, and motion graphics that transform raw footage into captivating visual stories.',
        deliverables: ['Reels, Shorts & Social Cuts', 'Commercial & Promotional Showreels', 'Color Grading & Audio Mixing', 'Motion Graphics & Subtitles'],
        startingPrice: '$200'
      },
      {
        id: 'digital-marketing',
        title: 'Digital Marketing',
        description: 'Creative marketing strategies paired with high-converting creative assets to expand your brand reach and drive measurable inbound results.',
        deliverables: ['Digital Ad Creative Design', 'Marketing Funnel Visual Strategy', 'Audience-targeted Campaign Assets', 'A/B Test Creative Variations'],
        startingPrice: '$250'
      },
      {
        id: 'website-design',
        title: 'Website Design and Creative Digital Solutions',
        description: 'Custom, modern, and responsive website designs built with contemporary layout principles, seamless usability, and strong brand alignment.',
        deliverables: ['Responsive Web Layouts', 'Landing Page & Portfolio Design', 'Asset Optimization & Clean Export', 'UX Flow Architecture'],
        startingPrice: '$450'
      }
    ];

    await run('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [
      'services_data',
      JSON.stringify(defaultServices)
    ]);
  }

  // Seed sample projects if empty
  if (store.projects.length === 0) {
    const sampleProjects = [
      {
        title: 'Aether Roasters - Artisan Coffee Packaging & Identity',
        slug: 'aether-roasters-packaging-identity',
        short_description: 'Luxury packaging system and minimalist brand identity for a specialty micro-roastery.',
        description: 'Aether Roasters sought a visual identity and packaging system that honored their commitment to single-origin, ethically sourced coffee beans. We developed an embossed matte-black and textured limestone color palette with gold foil stamped typography, custom tasting note labels, and collectible unboxing stationery.',
        category: 'Branding',
        tools_json: JSON.stringify(['Illustrator', 'Photoshop', 'Figma', 'Print Production']),
        cover_image_key: '/src/assets/images/project_artisan_branding_1793694566576.jpg',
        featured: 1,
        status: 'published',
        client_name: 'Aether Roasters (Sample)',
        project_url: 'https://www.sudipbhandari5.com.np',
        case_study_url: '',
        project_objective: 'Create a distinctive tactile packaging experience that communicates premium artisanal quality on retail shelves.',
        design_process: 'Explored geometric letterforms and luxury seal emblems, tested textured sustainable paper substrates, and finalized foil stamping specs.',
        final_outcome: 'Elevated brand perception and delivered complete production-ready die-lines and retail packaging standards.',
        published_at: new Date().toISOString()
      },
      {
        title: 'Oakwood Capital - Wealth Management Mobile UX & UI',
        slug: 'oakwood-capital-mobile-ux',
        short_description: 'Modern investment and wealth management interface with refined typography and data visualization.',
        description: 'A clean mobile banking and investment experience designed to bring tranquility to financial management. Features personalized portfolio balance breakdowns, intuitive investment trajectory graphs, and tactile card interactions designed for quick comprehension.',
        category: 'UI/UX Design',
        tools_json: JSON.stringify(['Figma', 'Design Systems', 'Prototyping', 'User Research']),
        cover_image_key: '/src/assets/images/project_fintech_uiux_1793694567220.jpg',
        featured: 1,
        status: 'published',
        client_name: 'Oakwood Capital (Sample)',
        project_url: 'https://www.sudipbhandari5.com.np',
        case_study_url: '',
        project_objective: 'Simplify complex multi-asset investment tracking into an effortless, trustworthy mobile interface.',
        design_process: 'Conducted user journey mapping, designed high-contrast dark theme components, and developed a modular financial card architecture.',
        final_outcome: 'Delivered 35+ responsive mobile screens and a comprehensive design system ready for engineering handoff.',
        published_at: new Date().toISOString()
      },
      {
        title: 'Monochrome & Terracotta - High Fashion Social Campaign',
        slug: 'monochrome-terracotta-fashion-campaign',
        short_description: 'Architectural social media editorial grid and multi-slide storytelling campaign.',
        description: 'A social media visual campaign for a contemporary autumn fashion collection. Emphasized dramatic editorial crops, oversized serif typography, and a stark black, white, and warm terracotta palette engineered to halt user scrolling.',
        category: 'Social Media Design',
        tools_json: JSON.stringify(['Photoshop', 'Illustrator', 'After Effects', 'Art Direction']),
        cover_image_key: '/src/assets/images/project_social_campaign_1793694567912.jpg',
        featured: 1,
        status: 'published',
        client_name: 'Studio M Fashion (Sample)',
        project_url: 'https://www.sudipbhandari5.com.np',
        case_study_url: '',
        project_objective: 'Craft a cohesive, magazine-quality Instagram carousel experience for the Autumn/Winter capsule launch.',
        design_process: 'Curated photographer lookbooks, built modular 9-tile layout grids, and balanced bold statement titles with detailed texture shots.',
        final_outcome: 'Resulted in a signature aesthetic grid template system deployed across seasonal brand rollouts.',
        published_at: new Date().toISOString()
      },
      {
        title: 'Nexus Energy - Sustainable Tech Visual Identity & Guidelines',
        slug: 'nexus-energy-brand-identity',
        short_description: 'Brand identity system, corporate guidelines, and growth marketing collateral for a clean tech company.',
        description: 'Nexus Energy pioneers solar microgrids. We built their comprehensive visual identity from the ground up: an organic leaf-circuit mark, a disciplined forest green and charcoal color scheme, a 48-page brand standards guide, and digital marketing banners.',
        category: 'Graphic Design',
        tools_json: JSON.stringify(['Illustrator', 'InDesign', 'Photoshop', 'Digital Marketing']),
        cover_image_key: '/src/assets/images/project_ecotech_growth_1793694567200.jpg',
        featured: 0,
        status: 'published',
        client_name: 'Nexus Energy Corp (Sample)',
        project_url: 'https://www.sudipbhandari5.com.np',
        case_study_url: '',
        project_objective: 'Establish a credible, modern visual identity that bridges ecological sustainability with high-tech engineering.',
        design_process: 'Drafted iterative logomark concepts, tested legibility at micro scales, and established comprehensive multi-channel brand assets.',
        final_outcome: 'A full brand identity system deployed across stationery, marketing decks, website, and physical collateral.',
        published_at: new Date().toISOString()
      }
    ];

    for (const p of sampleProjects) {
      await run(`
        INSERT INTO projects (
          title, slug, short_description, description, category, tools_json,
          cover_image_key, featured, status, client_name, project_url, case_study_url,
          project_objective, design_process, final_outcome, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.title, p.slug, p.short_description, p.description, p.category, p.tools_json,
        p.cover_image_key, p.featured, p.status, p.client_name, p.project_url, p.case_study_url,
        p.project_objective, p.design_process, p.final_outcome, p.published_at
      ]);
    }
  }

  // Provision initial Admin if none exists
  if (store.admins.length === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'bhandarysudip5@gmail.com';
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'SudipAdmin2026!';
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    await run('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [
      adminEmail,
      passwordHash
    ]);
    console.log(`[Database] Initial admin created for ${adminEmail}. Password configured securely.`);
  }
}

export default store;
