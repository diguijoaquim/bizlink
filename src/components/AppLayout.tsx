import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Bell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import bizlinkLogo from "@/assets/bizlink-logo.png";
import { getAuthToken, clearAuthToken } from "@/lib/api";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explorar", href: "/explore", icon: Search },
  { name: "Mensagens", href: "/messages", icon: MessageCircle },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Perfil", href: "/profile", icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
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

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
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
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
        <div className="grid grid-cols-5 py-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}