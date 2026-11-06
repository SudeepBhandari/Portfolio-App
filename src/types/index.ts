export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  tools: string[];
  cover_image_key: string;
  featured: boolean;
  status: 'published' | 'draft';
  client_name?: string;
  project_url?: string;
  case_study_url?: string;
  project_objective?: string;
  design_process?: string;
  final_outcome?: string;
  created_at?: string;
  published_at?: string;
  images?: { id: number; image_key: string; alt_text: string; sort_order: number }[];
  related?: Project[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  startingPrice?: string;
}

export interface ProfileData {
  fullName: string;
  professionalTitle: string;
  websiteDomain: string;
  primaryEmail: string;
  whatsAppNumber: string;
  whatsAppLink: string;
  avatarUrl: string;
  heroHeading: string;
  heroSubheading: string;
  bio: string;
  approach: string;
  goals: string;
  skills: string[];
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    behance?: string;
    dribbble?: string;
    twitter?: string;
  };
  cvUrl?: string;
}

export interface Inquiry {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
  budget?: string;
  deadline?: string;
  preferred_contact?: string;
  reference_url?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'archived';
  admin_notes?: string;
  created_at: string;
  email_status?: string;
  email_provider?: string;
  email_error?: string;
}

export interface AdminUser {
  id: number;
  email: string;
}
