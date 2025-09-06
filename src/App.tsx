import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomeProvider } from '@/contexts/HomeContext';
import { InstallPrompt } from '@/components/InstallPrompt';
import { getAuthToken } from "@/lib/api";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import MyServices from "./pages/MyServices";
import Register from "./pages/Register";
import CreateCompany from "./pages/CreateCompany";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";
import EditCompany from "./pages/EditCompany";
import EditService from "./pages/EditService";
import SearchPage from "./pages/SearchPage";
import Jobs from "./pages/Jobs";
import Companies from "./pages/Companies";
import Freelancers from "./pages/Freelancers";
import CreateJob from "./pages/CreateJob";
import JobDetail from "./pages/JobDetail";
import Portfolio from "./pages/Portfolio";
import CreatePortfolio from "./pages/CreatePortfolio";
import ProfileSetup from "./pages/ProfileSetup";
import ResetPassword from "./pages/ResetPassword";
import ChatSearch from "./pages/ChatSearch";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!getAuthToken();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


const App = () => {
  console.log('App component loading...');
  return (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <HomeProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chat-search" element={<ChatSearch />} />
          <Route
            path="/create-company"
            element={
              <ProtectedRoute>
                <CreateCompany />
              </ProtectedRoute>
            }
          />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* Profiles */}
          <Route path="/profile/:slug" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/edit-company"
            element={
              <ProtectedRoute>
                <EditCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-service/:id"
            element={
              <ProtectedRoute>
                <EditService />
              </ProtectedRoute>
            }
          />
          <Route path="/my-services" element={<MyServices />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          
          {/* Jobs Routes */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/edit/:id"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetail />} />
          
          {/* Portfolio Routes */}
          <Route path="/portfolio" element={<Portfolio />} />
          <Route
            path="/portfolio/create"
            element={
              <ProtectedRoute>
                <CreatePortfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/edit/:id"
            element={
              <ProtectedRoute>
                <CreatePortfolio />
              </ProtectedRoute>
            }
          />
          
          {/* Profile Setup Route */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
        </HomeProvider>
      </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;

