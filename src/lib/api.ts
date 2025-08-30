export const API_BASE_URL = "https://bizlink-production.up.railway.app";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Login failed with status ${response.status}`);
  }

  return (await response.json()) as LoginResponse;
}

export function saveAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token");
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  
  // Add auth token if it exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Don't set Content-Type for FormData - let the browser set it with the boundary
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}${input}`, { 
      ...init, 
      headers,
      // Do not send cookies with cross-origin requests when server uses wildcard CORS
      credentials: 'omit'
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed with status ${res.status}`);
    }
    
    // Handle empty response
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export type Company = {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  nuit?: string;
  nationality?: string;
  province?: string;
  district?: string;
  address?: string;
  website?: string;
  email?: string;
  whatsapp?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export async function getCompanies(): Promise<Company[]> {
  return apiFetch(`/companies/`);
}

export async function createCompany(input: {
  name: string;
  description: string;
  nuit: string;
  nationality: string;
  province: string;
  district: string;
  address: string;
  website?: string;
  email: string;
  whatsapp: string;
  logoFile?: File | null;
  coverFile?: File | null;
}): Promise<Company> {
  const formData = new FormData();

  formData.append('name', input.name);
  formData.append('description', input.description || '');
  formData.append('nuit', input.nuit || '');
  formData.append('nationality', input.nationality || '');
  formData.append('province', input.province || '');
  formData.append('district', input.district || '');
  formData.append('address', input.address || '');
  if (input.website) formData.append('website', input.website);
  formData.append('email', input.email || '');
  formData.append('whatsapp', input.whatsapp || '');
  if (input.logoFile) formData.append('logo', input.logoFile);
  if (input.coverFile) formData.append('cover', input.coverFile);

  const response = await apiFetch('/companies/', {
    method: 'POST',
    body: formData,
  });
  return response as Company;
}

export async function updateCompany(companyId: number, input: {
  name?: string;
  description?: string;
  nuit?: string;
  nationality?: string;
  province?: string;
  district?: string;
  address?: string;
  website?: string;
  email?: string;
  whatsapp?: string;
  logoFile?: File | null;
  coverFile?: File | null;
}): Promise<Company> {
  const formData = new FormData();

  if (input.name !== undefined) formData.append('name', input.name);
  if (input.description !== undefined) formData.append('description', input.description || '');
  if (input.nuit !== undefined) formData.append('nuit', input.nuit || '');
  if (input.nationality !== undefined) formData.append('nationality', input.nationality || '');
  if (input.province !== undefined) formData.append('province', input.province || '');
  if (input.district !== undefined) formData.append('district', input.district || '');
  if (input.address !== undefined) formData.append('address', input.address || '');
  if (input.website !== undefined && input.website !== null) formData.append('website', input.website);
  if (input.email !== undefined) formData.append('email', input.email || '');
  if (input.whatsapp !== undefined) formData.append('whatsapp', input.whatsapp || '');
  if (input.logoFile) formData.append('logo', input.logoFile);
  if (input.coverFile) formData.append('cover', input.coverFile);

  const response = await apiFetch(`/companies/${companyId}`, {
    method: 'PUT',
    body: formData,
  });
  return response as Company;
}

export async function updateCompanyLogo(companyId: number, file: File): Promise<Company> {
  const formData = new FormData();
  formData.append('logo', file);
  return apiFetch(`/companies/${companyId}/logo`, { method: 'PUT', body: formData });
}

export async function updateCompanyCover(companyId: number, file: File): Promise<Company> {
  const formData = new FormData();
  formData.append('cover', file);
  return apiFetch(`/companies/${companyId}/cover`, { method: 'PUT', body: formData });
}

export async function uploadFile(file: File, type: 'company/logo' | 'company/cover' | 'profile'): Promise<{ url: string }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = `/files/upload/${type}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to upload file');
  }

  return response.json();
}

export async function registerUser(input: { email: string; full_name?: string; password: string }) {
  return apiFetch(`/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// Service types and operations
export interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string;
  status: string;
  is_promoted: number;
  image_url?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  company?: {
    id: number;
    name: string;
    logo_url?: string;
    location?: string;
  };
}

export const createService = async (input: {
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string[];
  company_id: number;
  image?: File;
  status?: string;
  is_promoted?: boolean;
}): Promise<Service> => {
  const formData = new FormData();
  
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('price', input.price);
  formData.append('category', input.category);
  formData.append('tags', `{${input.tags.join(',')}}`);
  formData.append('company_id', input.company_id.toString());
  formData.append('status', input.status || 'Ativo');
  formData.append('is_promoted', input.is_promoted ? '1' : '0');
  
  if (input.image) {
    formData.append('image', input.image);
  }

  const response = await apiFetch('/services/', {
    method: 'POST',
    body: formData,
  });

  return response as Service;
};

export const getCompanyServices = async (companyId: number): Promise<Service[]> => {
  return apiFetch(`/services/company/${companyId}`);
};

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const getServices = async (page: number = 1, limit: number = 10): Promise<ServicesResponse> => {
  const data = await apiFetch(`/services/?page=${page}&limit=${limit}`);

  // Normalize various possible API shapes
  let services: Service[] = [];
  let total = 0;
  let total_pages = 1;

  if (Array.isArray(data)) {
    services = data as Service[];
    total = services.length;
    total_pages = 1;
  } else if (data && typeof data === 'object') {
    if (Array.isArray((data as any).services)) {
      services = (data as any).services as Service[];
      total = (data as any).total ?? services.length;
      total_pages = (data as any).total_pages ?? Math.max(1, Math.ceil(total / limit));
    } else if (Array.isArray((data as any).items)) {
      services = (data as any).items as Service[];
      total = (data as any).total ?? services.length;
      total_pages = (data as any).total_pages ?? Math.max(1, Math.ceil(total / limit));
    }
  }

  return { services, total, page, limit, total_pages };
};

export const getService = async (id: number): Promise<Service> => {
  return apiFetch(`/services/${id}`);
};

export const updateService = async (id: number, input: {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  tags?: string[];
  status?: string;
  is_promoted?: boolean;
  image?: File | null;
}): Promise<Service> => {
  const formData = new FormData();
  
  if (input.title !== undefined) formData.append('title', input.title);
  if (input.description !== undefined) formData.append('description', input.description);
  if (input.price !== undefined) formData.append('price', input.price);
  if (input.category !== undefined) formData.append('category', input.category);
  if (input.tags !== undefined) formData.append('tags', `{${input.tags.join(',')}}`);
  if (input.status !== undefined) formData.append('status', input.status);
  if (input.is_promoted !== undefined) formData.append('is_promoted', input.is_promoted ? '1' : '0');
  if (input.image) formData.append('image', input.image);

  const response = await apiFetch(`/services/${id}`, {
    method: 'PUT',
    body: formData,
  });

  return response as Service;
};

export const deleteService = async (id: number): Promise<void> => {
  await apiFetch(`/services/${id}`, {
    method: 'DELETE',
  });
};

export const promoteService = async (id: number, promote: boolean): Promise<Service> => {
  const formData = new FormData();
  formData.append('is_promoted', promote ? '1' : '0');
  
  const response = await apiFetch(`/services/${id}`, {
    method: 'PUT',
    body: formData,
  });

  return response as Service;
};

// Feed API
export interface FeedItem {
  id: number;
  type: 'service' | 'company' | 'user' | 'portfolio';
  // Service fields
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: any;
  status?: string;
  company_id?: number;
  image_url?: string;
  views?: number;
  leads?: number;
  likes?: number;
  is_promoted?: boolean;
  created_at?: string;
  // Company fields
  name?: string;
  logo_url?: string;
  cover_url?: string;
  province?: string;
  district?: string;
  address?: string;
  nationality?: string;
  website?: string;
  email?: string;
  whatsapp?: string;
  // User fields
  full_name?: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  gender?: string;
  // Portfolio fields
  media_url?: string;
  link?: string;
}

export interface FeedResponse {
  items: FeedItem[];
  total_returned: number;
  has_more: boolean;
  next_page_info: { last_id: number } | null;
  summary: {
    services_count: number;
    companies_count: number;
    users_count: number;
    portfolios_count: number;
  };
}

export async function getFeed(lastId?: number, limit: number = 10): Promise<FeedResponse> {
  const params = new URLSearchParams();
  if (lastId) params.append('last_id', lastId.toString());
  params.append('limit', limit.toString());
  
  const response = await apiFetch(`/search/feed?${params.toString()}`);
  return response;
}

export async function searchFeed(query: string, lastId?: number, limit: number = 10): Promise<FeedResponse> {
  const params = new URLSearchParams();
  params.append('q', query);
  if (lastId) params.append('last_id', lastId.toString());
  params.append('limit', limit.toString());
  
  const response = await apiFetch(`/search/feed?${params.toString()}`);
  return response;
}

// Regular Search API (structured by categories)
export interface SearchResults {
  services: Service[];
  companies: Company[];
  users: any[];
  portfolios: any[];
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResults;
  summary: {
    services_count: number;
    companies_count: number;
    users_count: number;
    portfolios_count: number;
  };
}

export async function search(query: string, limit: number = 20): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('limit', limit.toString());
  
  const response = await apiFetch(`/search/?${params.toString()}`);
  return response;
}



