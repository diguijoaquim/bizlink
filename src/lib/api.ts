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

// Helper function to check if user exists
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Try to get user info without authentication
    const response = await fetch(`${API_BASE_URL}/users/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200) {
      const data = await response.json();
      return data.exists === true;
    }
    return false;
  } catch (error) {
    // If endpoint doesn't exist, assume user doesn't exist
    return false;
  }
}

export async function loginWithGoogle(credential: string): Promise<LoginResponse> {
  try {
    // Decode the base64 encoded user info
    const userInfo = JSON.parse(atob(credential));
    const email = userInfo.email;
    const name = userInfo.name;
    
    if (!email) {
      throw new Error('Email não encontrado na resposta do Google');
    }
    // Call backend Google auth which logs in existing users or creates new ones
    const response = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: name || email.split('@')[0] })
    });
    return response as LoginResponse;
  } catch (error: any) {
    console.error('Google login error:', error);
    throw new Error(error.message || 'Falha na autenticação Google');
  }
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
    // Headers específicos para usuários autenticados
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate, private");
    headers.set("Pragma", "no-cache");
  }
  
  // Don't set Content-Type for FormData - let the browser set it with the boundary
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}${input.startsWith('/') ? input : `/${input}`}`, { 
      ...init, 
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const detail = (error && (error.detail || error.message))
        ? (typeof (error.detail || error.message) === 'string' ? (error.detail || error.message) : JSON.stringify(error.detail || error.message))
        : `Request failed with status ${res.status}`;
      throw new Error(detail);
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

export type CompanyServiceStats = {
  total: number;
  active: number;
  promoted: number;
  views: number;
};

export type FreelancerProfile = {
  id: number;
  user_id: number;
  title?: string;
  description: string;  // Descrição completa incluindo skills, experiência, etc.
  hourly_rate?: number;
  currency: string;
  location?: string;
  remote_work: boolean;
  completed_projects: number;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: number;
  company_id: number;
  title: string;
  description: string;
  location?: string;
  remote_work: boolean;
  status: string;
  views: number;
  applications: number;
  is_promoted: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type CompanyPortfolio = {
  id: number;
  company_id: number;
  title: string;
  description?: string;
  media_url?: string;
  link?: string;
  created_at: string;
};

export type JobCreate = Omit<Job, 'id' | 'views' | 'applications' | 'created_at' | 'updated_at'>;
export type JobUpdate = Partial<Omit<Job, 'id' | 'company_id' | 'views' | 'applications' | 'created_at' | 'updated_at'>>;

export type CompanyPortfolioCreate = Omit<CompanyPortfolio, 'id' | 'created_at'>;
export type CompanyPortfolioUpdate = Partial<Omit<CompanyPortfolio, 'id' | 'company_id' | 'created_at'>>;

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

export const getCompanyServiceStats = async (companyId: number): Promise<CompanyServiceStats> => {
  return apiFetch(`/services/company/${companyId}/stats`);
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
  type: 'service' | 'company' | 'user' | 'portfolio' | 'job';
  // Service fields
  title?: string;
  description?: string;
  location?: string;
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
  // Poster info
  poster_type?: 'company' | 'user' | 'freelancer' | null;
  poster_name?: string | null;
  poster_avatar?: string | null;
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
  
  console.log('Searching with params:', params.toString());
  const response = await apiFetch(`/search/?${params.toString()}`);
  console.log('Raw search response:', response);
  
  // Transform the search response to match FeedResponse format
  if (response && response.results) {
    console.log('Search results found:', response.results);
    const items: FeedItem[] = [
      ...response.results.services.map(service => ({
        id: service.id,
        type: 'service' as const,
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
        tags: service.tags,
        status: service.status,
        company_id: service.company_id,
        image_url: service.image_url,
        views: service.views,
        leads: service.leads,
        likes: service.likes,
        is_promoted: service.is_promoted,
        created_at: service.created_at
      })),
      ...response.results.companies.map(company => ({
        id: company.id,
        type: 'company' as const,
        name: company.name,
        description: company.description,
        logo_url: company.logo_url,
        cover_url: company.cover_url,
        province: company.province,
        district: company.district,
        address: company.address,
        nationality: company.nationality,
        website: company.website,
        email: company.email,
        whatsapp: company.whatsapp,
        created_at: company.created_at
      })),
      ...response.results.users.map(user => ({
        id: user.id,
        type: 'user' as const,
        full_name: user.full_name,
        profile_photo_url: user.profile_photo_url,
        cover_photo_url: user.cover_photo_url,
        gender: user.gender,
        created_at: user.created_at
      })),
      ...response.results.portfolios.map(portfolio => ({
        id: portfolio.id,
        type: 'portfolio' as const,
        media_url: portfolio.media_url,
        link: portfolio.link,
        created_at: portfolio.created_at
      }))
    ];
    
    console.log('Transformed items:', items);
    
    return {
      items,
      total_returned: items.length,
      has_more: items.length >= limit,
      next_page_info: items.length >= limit ? { last_id: items[items.length - 1].id } : null,
      summary: response.summary
    };
  }
  
  console.log('No search results found, returning empty response');
  return {
    items: [],
    total_returned: 0,
    has_more: false,
    next_page_info: null,
    summary: {
      services_count: 0,
      companies_count: 0,
      users_count: 0,
      portfolios_count: 0
    }
  };
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

// Jobs API Functions
export async function getJobs(params?: {
  company_id?: number;
  status_filter?: string;
  location?: string;
  remote_work?: boolean;
  skip?: number;
  limit?: number;
}): Promise<Job[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.company_id) searchParams.append('company_id', params.company_id.toString());
  if (params?.status_filter) searchParams.append('status_filter', params.status_filter);
  if (params?.location) searchParams.append('location', params.location);
  if (params?.remote_work !== undefined) searchParams.append('remote_work', params.remote_work.toString());
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  return apiFetch(`/jobs/${queryString ? `?${queryString}` : ''}`);
}

export async function getJob(jobId: number): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`);
}

export async function createJob(input: {
  title: string;
  description: string;
  location?: string;
  remote_work?: boolean;
  status?: string;
  is_promoted?: boolean;
  company_id: number;
  image?: File;
}): Promise<Job> {
  const formData = new FormData();
  
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('company_id', input.company_id.toString());
  formData.append('status', input.status || 'Ativa');
  formData.append('is_promoted', input.is_promoted ? '1' : '0');
  
  if (input.location) {
    formData.append('location', input.location);
  }
  
  if (input.remote_work !== undefined) {
    formData.append('remote_work', input.remote_work ? '1' : '0');
  }
  
  if (input.image) {
    formData.append('image', input.image);
  }

  return apiFetch('/jobs/', {
    method: 'POST',
    body: formData
  });
}

export async function updateJob(jobId: number, job: JobUpdate): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(job)
  });
}

export async function deleteJob(jobId: number): Promise<void> {
  return apiFetch(`/jobs/${jobId}`, {
    method: 'DELETE'
  });
}

export async function updateJobStatus(jobId: number, status: string): Promise<Job> {
  return apiFetch(`/jobs/${jobId}/status?status=${status}`, {
    method: 'PATCH'
  });
}

export async function toggleJobPromotion(jobId: number): Promise<Job> {
  return apiFetch(`/jobs/${jobId}/promote`, {
    method: 'PATCH'
  });
}

export async function getCompanyJobs(companyId: number, params?: {
  status_filter?: string;
  skip?: number;
  limit?: number;
}): Promise<Job[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.status_filter) searchParams.append('status_filter', params.status_filter);
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  return apiFetch(`/jobs/company/${companyId}${queryString ? `?${queryString}` : ''}`);
}

export async function getMyJobs(): Promise<Job[]> {
  return await apiFetch('/jobs/my-jobs');
}

// Portfolio API Functions
export async function getPortfolioItems(params?: {
  company_id?: number;
  skip?: number;
  limit?: number;
}): Promise<CompanyPortfolio[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.company_id) searchParams.append('company_id', params.company_id.toString());
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  return apiFetch(`/portfolio/${queryString ? `?${queryString}` : ''}`);
}

export async function getPortfolioItem(portfolioId: number): Promise<CompanyPortfolio> {
  return apiFetch(`/portfolio/${portfolioId}`);
}

export async function createPortfolioItem(data: FormData): Promise<CompanyPortfolio> {
  // Extrair dados do FormData para enviar como query parameters
  const title = data.get('title') as string;
  const description = data.get('description') as string;
  const link = data.get('link') as string;
  const company_id = data.get('company_id') as string;
  
  // Criar URL com query parameters
  const params = new URLSearchParams();
  params.append('title', title);
  if (description) params.append('description', description);
  if (link) params.append('link', link);
  params.append('company_id', company_id);
  
  // Criar novo FormData apenas com o arquivo de mídia
  const mediaFormData = new FormData();
  const mediaFile = data.get('media_file') as File;
  if (mediaFile) {
    mediaFormData.append('media_file', mediaFile);
  }
  
  return apiFetch(`/portfolio/?${params.toString()}`, {
    method: 'POST',
    body: mediaFormData
  });
}

export async function updatePortfolioItem(portfolioId: number, data: FormData): Promise<CompanyPortfolio> {
  // Extrair dados do FormData para enviar como query parameters
  const title = data.get('title') as string;
  const description = data.get('description') as string;
  const link = data.get('link') as string;
  
  // Criar URL com query parameters
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (description) params.append('description', description);
  if (link) params.append('link', link);
  
  // Criar novo FormData apenas com o arquivo de mídia
  const mediaFormData = new FormData();
  const mediaFile = data.get('media_file') as File;
  if (mediaFile) {
    mediaFormData.append('media_file', mediaFile);
  }
  
  return apiFetch(`/portfolio/${portfolioId}?${params.toString()}`, {
    method: 'PUT',
    body: mediaFormData
  });
}

export async function deletePortfolioItem(portfolioId: number): Promise<void> {
  return apiFetch(`/portfolio/${portfolioId}`, {
    method: 'DELETE'
  });
}

export async function getCompanyPortfolio(companyId: number, params?: {
  skip?: number;
  limit?: number;
}): Promise<CompanyPortfolio[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  return apiFetch(`/portfolio/company/${companyId}${queryString ? `?${queryString}` : ''}`);
}

export async function updatePortfolioMedia(portfolioId: number, mediaFile: File): Promise<CompanyPortfolio> {
  const formData = new FormData();
  formData.append('media_file', mediaFile);
  
  return apiFetch(`/portfolio/${portfolioId}/media`, {
    method: 'POST',
    body: formData
  });
}

export type User = {
  id: number;
  email: string;
  full_name?: string;
  user_type: string;  // 'simple', 'freelancer', 'company'
  username?: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  gender?: string;
  bio?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  companies: Company[];
  freelancer_profile?: FreelancerProfile;
};

// Freelancer Profile API
export async function createFreelancerProfile(profile: {
  title?: string;
  description: string;
  hourly_rate?: number;
  currency?: string;
  location?: string;
  remote_work?: boolean;
}): Promise<FreelancerProfile> {
  return apiFetch('/freelancer/profile', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
}

export async function getFreelancerProfile(): Promise<FreelancerProfile> {
  return apiFetch('/freelancer/profile');
}

export async function updateFreelancerProfile(profile: {
  title?: string;
  description?: string;
  hourly_rate?: number;
  currency?: string;
  location?: string;
  remote_work?: boolean;
}): Promise<FreelancerProfile> {
  return apiFetch('/freelancer/profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
}

export async function deleteFreelancerProfile(): Promise<void> {
  return apiFetch('/freelancer/profile', {
    method: 'DELETE'
  });
}

export async function searchFreelancers(params?: {
  location?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  remote_work?: boolean;
  skip?: number;
  limit?: number;
}): Promise<FreelancerProfile[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.location) searchParams.append('location', params.location);
  if (params?.min_hourly_rate) searchParams.append('min_hourly_rate', params.min_hourly_rate.toString());
  if (params?.max_hourly_rate) searchParams.append('max_hourly_rate', params.max_hourly_rate.toString());
  if (params?.remote_work !== undefined) searchParams.append('remote_work', params.remote_work.toString());
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  return apiFetch(`/freelancer/search?${searchParams.toString()}`);
}

// User Profile Management
export async function updateUserProfile(profile: {
  full_name?: string;
  bio?: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  province?: string;
  district?: string;
  user_type?: 'simple' | 'freelancer' | 'company';
  username?: string;
}): Promise<User> {
  return apiFetch('/users/me', {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
}

// Deprecated: use updateUserProfile({ user_type }) instead to avoid CORS on some hosts
export async function changeUserType(newType: 'simple' | 'freelancer' | 'company'): Promise<User> {
  return updateUserProfile({ user_type: newType });
}

export async function getUserProfile(): Promise<User> {
  return apiFetch('/users/me');
}

export async function getUserByIdPublic(id: number): Promise<User> {
  return apiFetch(`/users/${id}`);
}
// Chat API
export type ConversationListItem = {
  id: number;
  peer: { id: number; full_name?: string; email: string; profile_photo_url?: string };
  last_message: string;
  last_time?: string | null;
};

export type ChatMessageItem = {
  id: number;
  text: string;
  time: string;
  isMe: boolean;
};

export async function getConversations(): Promise<ConversationListItem[]> {
  return apiFetch('/chat/conversations');
}

export async function startConversation(peerUserId: number): Promise<{ id: number }> {
  const params = new URLSearchParams({ peer_user_id: String(peerUserId) });
  return apiFetch(`/chat/conversations/start?${params.toString()}`, { method: 'POST' });
}

export async function getMessages(conversationId: number): Promise<ChatMessageItem[]> {
  return apiFetch(`/chat/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: number, text: string): Promise<{ id: number }> {
  const params = new URLSearchParams({ text });
  return apiFetch(`/chat/conversations/${conversationId}/send?${params.toString()}`, { method: 'POST' });
}

// Recipients (users/companies) for chat
export async function getRecipients(params: { type?: 'companies' | 'freelancer' | 'simple' | 'users' | 'all'; q?: string; limit?: number }): Promise<{ users?: User[]; companies?: Company[] }> {
  const p = new URLSearchParams();
  if (params.type) p.append('type', params.type);
  if (params.q) p.append('q', params.q);
  if (params.limit) p.append('limit', String(params.limit));
  return apiFetch(`/chat/recipients?${p.toString()}`);
}

export function connectChatWS(conversationId: number): WebSocket | null {
  const token = getAuthToken();
  if (!token) return null;
  const url = `${API_BASE_URL.replace('http', 'ws')}/chat/ws?conversation_id=${conversationId}&token=${encodeURIComponent(token)}`;
  return new WebSocket(url);
}

// Utility: current user id from JWT (sub)
export function getCurrentUserId(): number | null {
  const token = getAuthToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64));
    const sub = json.sub ?? json.user_id;
    const id = parseInt(String(sub), 10);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export async function getUserBySlug(slug: string): Promise<User> {
  return apiFetch(`/users/by-slug/${encodeURIComponent(slug)}`);
}

// Search users function
export async function searchUsers(params?: {
  query?: string;
  skip?: number;
  limit?: number;
}): Promise<User[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.query) searchParams.append('q', params.query);
  if (params?.skip) searchParams.append('skip', params.skip.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  const response = await apiFetch(`/search/?${queryString}`);
  
  // Extract users from search response
  if (response && response.results && response.results.users) {
    return response.results.users;
  }
  
  return [];
}


// User photo uploads
export async function uploadUserProfilePhoto(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('photo', file);
  return apiFetch('/profile/me/profile-photo', {
    method: 'PUT',
    body: formData
  });
}

export async function uploadUserCoverPhoto(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('photo', file);
  return apiFetch('/profile/me/cover-photo', {
    method: 'PUT',
    body: formData
  });
}

// Password reset (OTP)
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function completePasswordReset(params: { email: string; otp: string; newPassword: string }): Promise<void> {
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email: params.email, otp: params.otp, new_password: params.newPassword })
  });
}

export async function verifyPasswordResetOtp(params: { email: string; otp: string }): Promise<{ token: string }> {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function resetPasswordWithToken(params: { token: string; newPassword: string }): Promise<void> {
  await apiFetch('/auth/reset-password-token', {
    method: 'POST',
    body: JSON.stringify({ token: params.token, new_password: params.newPassword })
  });
}

// Like system types and functions
export interface LikeData {
  likeable_type: 'service' | 'job' | 'company';
  likeable_id: number;
}

export interface LikeResponse {
  likes_count: number;
  is_liked: boolean;
}

export interface LikeOut {
  id: number;
  user_id: number;
  likeable_type: string;
  likeable_id: number;
  created_at: string;
}

// Like a service, job, or company
export async function toggleLike(likeable_type: 'service' | 'job' | 'company', likeable_id: number): Promise<LikeOut | { message: string; liked: boolean }> {
  const likeData: LikeData = {
    likeable_type,
    likeable_id
  };

  return await apiFetch('/likes/', {
    method: 'POST',
    body: JSON.stringify(likeData),
  });
}

// Get likes count and user's like status
export async function getLikesInfo(likeable_type: 'service' | 'job' | 'company', likeable_id: number): Promise<LikeResponse> {
  return await apiFetch(`/likes/${likeable_type}/${likeable_id}/count`);
}

// Get user's likes
export async function getUserLikes(userId: number): Promise<LikeOut[]> {
  return await apiFetch(`/likes/user/${userId}`);
}



