import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, getCompanyServices, Service, Company, getUserByIdPublic, getUserBySlug } from '@/lib/api';

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
  // User data
  user: User | null;
  userLoading: boolean;
  hasCompany: boolean;
  
  // Services data
  services: Service[];
  servicesLoading: boolean;
  
  // Functions
  loadUserData: () => Promise<void>;
  loadServices: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Company helpers
  currentCompany: Company | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const currentCompany = user?.companies?.[0] || null;

  const loadUserData = async () => {
    try {
      console.log('HomeContext: Loading user data...');
      setUserLoading(true);
      // Public profile view via query or slug
      const params = new URLSearchParams(window.location.search);
      const userIdParam = params.get('user_id');
      const slugMatch = window.location.pathname.match(/^\/@([^/]+)$/);
      let userData: any;
      if (slugMatch && slugMatch[1]) {
        userData = await getUserBySlug(slugMatch[1]);
      } else if (userIdParam) {
        userData = await getUserByIdPublic(parseInt(userIdParam, 10));
      } else {
        userData = await apiFetch('/users/me');
      }
      console.log('HomeContext: User data loaded:', userData);
      
      setUser(userData);
      const owned = Array.isArray(userData?.companies) && userData.companies.length > 0;
      setHasCompany(owned);
      
      // Auto-load services if user has a company
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
      console.log('HomeContext: Loading services for company:', companyId);
      setServicesLoading(true);
      const companyServices = await getCompanyServices(companyId);
      console.log('HomeContext: Services loaded:', companyServices);
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

  // Initialize data on mount
  useEffect(() => {
    loadUserData();
  }, []);

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
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};