import { Project, ServiceItem, ProfileData, Inquiry, AdminUser } from '../types';

const TOKEN_KEY = 'admin_session_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Public Endpoints
  async getProfile(): Promise<ProfileData> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to load services');
    return res.json();
  },

  async getProjects(params?: { category?: string; search?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async getProjectBySlug(slug: string): Promise<Project> {
    const res = await fetch(`/api/projects/${slug}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('Project not found');
      throw new Error('Failed to load project details');
    }
    return res.json();
  },

  async submitInquiry(data: {
    full_name: string;
    email: string;
    company?: string;
    service: string;
    message: string;
    budget?: string;
    deadline?: string;
    preferred_contact?: string;
    reference_url?: string;
    website_hp?: string;
  }): Promise<{ success: boolean; inquiryId: number; message: string; whatsAppUrl: string }> {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit inquiry');
    return result;
  },

  // Admin Endpoints
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    if (result.token) {
      setStoredToken(result.token);
    }
    return result;
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } finally {
      setStoredToken(null);
    }
  },

  async adminCheckMe(): Promise<{ authenticated: boolean; admin?: AdminUser }> {
    const token = getStoredToken();
    if (!token) {
      return { authenticated: false };
    }
    try {
      const res = await fetch('/api/admin/me', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) {
        setStoredToken(null);
        return { authenticated: false };
      }
      return res.json();
    } catch {
      return { authenticated: false };
    }
  },

  async adminChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update password');
  },

  async adminGetOverview(): Promise<{
    stats: {
      publishedProjects: number;
      draftProjects: number;
      totalInquiries: number;
      newInquiries: number;
    };
    recentInquiries: Inquiry[];
  }> {
    const res = await fetch('/api/admin/overview', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Session expired or unauthorized');
      throw new Error('Failed to load overview data');
    }
    return res.json();
  },

  async adminGetProjects(params?: { category?: string; status?: string; search?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/admin/projects?${query.toString()}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Session expired or unauthorized');
      throw new Error('Failed to load admin projects');
    }
    return res.json();
  },

  async adminCreateProject(data: Partial<Project>): Promise<{ success: boolean; id: number; slug: string }> {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create project');
    return result;
  },

  async adminUpdateProject(id: number, data: Partial<Project>): Promise<void> {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update project');
  },

  async adminDeleteProject(id: number): Promise<void> {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete project');
  },

  async adminUploadImage(file: File): Promise<{ success: boolean; fileKey: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/uploads', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Image upload failed');
    return result;
  },

  async adminGetInquiries(params?: { status?: string; search?: string }): Promise<Inquiry[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/admin/inquiries?${query.toString()}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Session expired or unauthorized');
      throw new Error('Failed to load inquiries');
    }
    return res.json();
  },

  async adminUpdateInquiry(id: number, data: { status?: string; admin_notes?: string }): Promise<void> {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update inquiry');
  },

  async adminRetryEmail(id: number): Promise<{ success: boolean; status: string; provider?: string; errorSummary?: string }> {
    const res = await fetch(`/api/admin/inquiries/${id}/retry-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to retry email notification');
    return result;
  },

  async adminDeleteInquiry(id: number): Promise<void> {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete inquiry');
  },

  async adminGetSettings(): Promise<{ profile: ProfileData; services: ServiceItem[] }> {
    const res = await fetch('/api/admin/settings', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Session expired or unauthorized');
      throw new Error('Failed to load settings');
    }
    return res.json();
  },

  async adminUpdateSettings(data: { profile?: ProfileData; services?: ServiceItem[] }): Promise<void> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to save settings');
  },

  async adminUploadCV(file: File): Promise<{ success: boolean; cvUrl: string }> {
    const formData = new FormData();
    formData.append('cv', file);
    const res = await fetch('/api/admin/upload-cv', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'CV upload failed');
    return result;
  }
};
