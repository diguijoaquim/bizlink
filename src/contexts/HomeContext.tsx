import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch, getCompanyServices, Service, Company, getUserByIdPublic, getUserBySlug, getFeed, type FeedItem, getConversations, type ConversationListItem, getJobs, type Job, getCompanies } from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name?: string;
  user_type?: string;  // 'simple', 'freelancer', 'company'
  profile_photo_url?: string;
  cover_photo_url?: string;
  gender?: string;
  bio?: string;
  phone?: string;
  nationality?: string;
  province?: string;
  district?: string;
  companies?: Company[];
}

interface HomeContextType {
  user: User | null;
  userLoading: boolean;
  hasCompany: boolean;
  services: Service[];
  servicesLoading: boolean;
  loadUserData: () => Promise<void>;
  loadServices: () => Promise<void>;
  refreshData: () => Promise<void>;
  currentCompany: Company | null;
  displayName: string | undefined;
  displayAvatar: string | undefined;
  displayCover: string | undefined;
  // cached data
  feedItems: FeedItem[];
  feedLoaded: boolean;
  loadFeedOnce: () => Promise<void>;
  conversations: ConversationListItem[];
  conversationsLoaded: boolean;
  loadConversationsOnce: () => Promise<void>;
  jobs: Job[];
  jobsLoaded: boolean;
  loadJobsOnce: () => Promise<void>;
  companies: Company[];
  companiesLoaded: boolean;
  loadCompaniesOnce: () => Promise<void>;
}

const HomeContext = createContext<HomeContextType | null>(null);

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};

interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider = ({ children }: HomeProviderProps) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  // caches
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  const currentCompany = user?.companies?.[0] || null;
  const displayName = currentCompany?.name || user?.full_name || user?.email;
  const displayAvatar = currentCompany?.logo_url || user?.profile_photo_url;
  const displayCover = currentCompany?.cover_url || user?.cover_photo_url;

  const loadUserData = async () => {
    try {
      setUserLoading(true);
      const params = new URLSearchParams(window.location.search);
      const userIdParam = params.get('user_id');
      const slugMatch = window.location.pathname.match(/^\/profile\/([^/]+)$/);
      let userData: any;
      if (slugMatch && slugMatch[1]) {
        userData = await getUserBySlug(slugMatch[1]);
      } else if (userIdParam) {
        userData = await getUserByIdPublic(parseInt(userIdParam, 10));
      } else {
        userData = await apiFetch('/users/me');
      }
      setUser(userData);
      const owned = Array.isArray(userData?.companies) && userData.companies.length > 0;
      setHasCompany(owned);
      if (owned && userData?.companies?.[0]?.id) {
        await loadServicesInternal(userData.companies[0].id);
      }
    } catch (error) {
      console.error('HomeContext: Error loading user data:', error);
      setUser(null);
      setHasCompany(false);
    } finally {
      setUserLoading(false);
    }
  };

  const loadServicesInternal = async (companyId: number) => {
    try {
      setServicesLoading(true);
      const companyServices = await getCompanyServices(companyId);
      setServices(companyServices);
    } catch (error) {
      console.error('HomeContext: Error loading services:', error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadServices = async () => {
    if (currentCompany?.id) {
      await loadServicesInternal(currentCompany.id);
    }
  };

  const refreshData = async () => {
    await loadUserData();
  };

  // one-time loaders
  const loadFeedOnce = async () => {
    if (feedLoaded) return;
    try {
      const resp = await getFeed(undefined, 10);
      setFeedItems(resp.items || []);
    } finally {
      setFeedLoaded(true);
    }
  };

  const loadConversationsOnce = async () => {
    if (conversationsLoaded) return;
    try {
      const list = await getConversations();
      setConversations(list || []);
    } finally {
      setConversationsLoaded(true);
    }
  };

  const loadJobsOnce = async () => {
    if (jobsLoaded) return;
    try {
      const list = await getJobs({ status_filter: 'Ativa' });
      setJobs(list || []);
    } finally {
      setJobsLoaded(true);
    }
  };

  const loadCompaniesOnce = async () => {
    if (companiesLoaded) return;
    try {
      const list = await getCompanies();
      setCompaniesList(list || []);
    } finally {
      setCompaniesLoaded(true);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Preload common datasets in background so pages open instantly later
  useEffect(() => {
    // fire-and-forget; loaders are idempotent via *Loaded flags
    loadFeedOnce();
    loadJobsOnce();
    loadCompaniesOnce();
    loadConversationsOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isProfileRoute = location.pathname === '/profile' || location.pathname.startsWith('/@');
    if (isProfileRoute) {
      loadUserData();
    }
  }, [location.pathname, location.search]);

  const value: HomeContextType = {
    user,
    userLoading,
    hasCompany,
    services,
    servicesLoading,
    loadUserData,
    loadServices,
    refreshData,
    currentCompany,
    displayName,
    displayAvatar,
    displayCover,
    feedItems,
    feedLoaded,
    loadFeedOnce,
    conversations,
    conversationsLoaded,
    loadConversationsOnce,
    jobs,
    jobsLoaded,
    loadJobsOnce,
    companies: companiesList,
    companiesLoaded,
    loadCompaniesOnce,
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};