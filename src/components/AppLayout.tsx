import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Bell, Menu, X, Briefcase, Image, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import bizlinkLogo from "@/assets/bizlink-logo.png";
import { getAuthToken, clearAuthToken, API_BASE_URL } from "@/lib/api";
import { useHome } from "@/contexts/HomeContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explorar", href: "/explore", icon: Search },
  { name: "Vagas", href: "/jobs", icon: Briefcase },
  { name: "Chat", href: "/messages", icon: MessageCircle },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Perfil", href: "/profile", icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useHome();
  const isMobile = useIsMobile();
  const isChatRoute = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
  const showHeader = !(isChatRoute && isMobile);
  const showBottomNav = !(isChatRoute && isMobile);

  const profileSrc = user?.profile_photo_url
    ? (user.profile_photo_url.startsWith("http") ? user.profile_photo_url : `${API_BASE_URL}${user.profile_photo_url}`)
    : undefined;
  const fallbackInitial = (() => {
    const base = (user?.full_name || user?.email || "U").trim();
    return base ? base.charAt(0).toUpperCase() : "U";
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={bizlinkLogo} alt="BizLink" className="h-10 w-10" />
              <h1 className="text-xl font-bold gradient-text">BizLink</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                      isActive
                        ? "bg-gradient-primary text-white shadow-bizlink-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
              {!getAuthToken() ? (
                <div className="flex items-center space-x-2 ml-2">
                  <NavLink to="/register" className="text-sm text-primary px-3 py-2 hover:underline rounded-full">
                    Registar
                  </NavLink>
                  <NavLink to="/login" className="text-sm text-primary px-3 py-2 hover:underline rounded-full">
                    Logar
                  </NavLink>
                </div>
              ) : (
                <Button variant="outline" className="ml-2" onClick={() => { clearAuthToken(); window.location.href = "/login"; }}>
                  Sair
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>
      )}

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && showHeader && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 right-0 left-0 bg-card border-b border-border p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-primary text-white shadow-bizlink-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
              {!getAuthToken() ? (
                <div className="flex items-center space-x-2 px-4 py-2">
                  <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className="text-sm text-primary px-3 py-2 hover:underline rounded-full">
                    Registar
                  </NavLink>
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-primary px-3 py-2 hover:underline rounded-full">
                    Logar
                  </NavLink>
                </div>
              ) : (
                <Button variant="outline" className="ml-4" onClick={() => { clearAuthToken(); window.location.href = "/login"; }}>
                  Sair
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`w-full md:container md:mx-auto px-0 md:px-4 py-6 md:max-w-4xl ${showBottomNav ? 'pb-20 md:pb-6' : 'pb-0 md:pb-6'}`}>
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:hidden z-50" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
          <div className="grid grid-cols-6 py-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center py-1 gap-0.5 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.name === "Perfil" ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={profileSrc}
                      alt={user?.full_name || "Perfil"} 
                      className="border border-indigo-500"
                    />
                    <AvatarFallback className="text-[10px]">{fallbackInitial}</AvatarFallback>
                  </Avatar>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className="text-[10px] leading-none">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}