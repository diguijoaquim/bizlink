import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Bell, Menu, X, Briefcase, Image, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import bizlinkLogo from "@/assets/bizlink-logo.png";
import { getAuthToken, clearAuthToken, apiFetch, connectNotificationsWS, API_BASE_URL } from "@/lib/api";
import { useHome } from "@/contexts/HomeContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Empresas", href: "/companies", icon: Building2 },
  { name: "Vagas", href: "/jobs", icon: Briefcase },
  { name: "Chat", href: "/messages", icon: MessageCircle },
  { name: "Notificações", href: "/notifications", icon: Bell },
  { name: "Perfil", href: "/profile", icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, displayAvatar } = useHome();
  const isMobile = useIsMobile();
  const isChatRoute = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
  const showHeader = !(isChatRoute && isMobile);
  const showBottomNav = !(isChatRoute && isMobile);

  const profileSrc = (displayAvatar || user?.profile_photo_url)
    ? ((displayAvatar || user?.profile_photo_url)!.startsWith("http") ? (displayAvatar || user?.profile_photo_url)! : `${API_BASE_URL}${displayAvatar || user?.profile_photo_url}`)
    : undefined;
  const fallbackInitial = (() => {
    const base = (user?.full_name || user?.email || "U").trim();
    return base ? base.charAt(0).toUpperCase() : "U";
  })();

  // Realtime notifications badge
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [chatUnread, setChatUnread] = useState<number>(0);
  const activeChatIdRef = useRef<number | null>(null);
  const formatBadgeCount = (count: number) => (count > 9 ? "9+" : String(count));

  useEffect(() => {
    let socket: WebSocket | null = null;
    const init = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        // initial unread count
        const data = await apiFetch('/notifications/?limit=50');
        const unread = (data as any[]).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch {}
      try {
        socket = connectNotificationsWS();
        if (socket) {
          socket.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg?.event === 'notification') {
                // If it's a chat notification, update chat badge; otherwise notifications badge
                const data = msg?.data;
                if (data?.type === 'chat') {
                  const convId = Number(data?.conversation_id);
                  if (activeChatIdRef.current !== convId) {
                    setChatUnread((c) => c + 1);
                  }
                } else {
                  setUnreadCount((c) => c + 1);
                }
              }
            } catch {}
          };
        }
      } catch {}
    };
    init();

    const handler = (e: any) => {
      if (typeof e?.detail === 'number') setUnreadCount(e.detail);
    };
    window.addEventListener('notifications:unread', handler as any);

    return () => {
      try { socket?.close(); } catch {}
      window.removeEventListener('notifications:unread', handler as any);
    };
  }, [location.pathname]);

  useEffect(() => {
    const onActive = (e: any) => {
      const val = e?.detail;
      activeChatIdRef.current = (val === null || val === undefined) ? null : Number(val);
    };
    const onClear = () => setChatUnread(0);
    window.addEventListener('chat:active', onActive as any);
    window.addEventListener('chat:clear-unread', onClear as any);
    return () => {
      window.removeEventListener('chat:active', onActive as any);
      window.removeEventListener('chat:clear-unread', onClear as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold gradient-text">BizLink MZ</h1>
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
                  <div className="relative">
                    {item.name === "Notificações" && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 inline-flex min-w-[18px] h-4 px-1 items-center justify-center bg-red-500 text-white rounded-full text-[10px] leading-none">
                        {formatBadgeCount(unreadCount)}
                      </span>
                    )}
                    {item.name === "Chat" && chatUnread > 0 && (
                      <span className="absolute -top-2 -right-3 inline-flex min-w-[18px] h-4 px-1 items-center justify-center bg-emerald-600 text-white rounded-full text-[10px] leading-none">
                        {formatBadgeCount(chatUnread)}
                      </span>
                    )}
                    <item.icon className="h-5 w-5" />
                  </div>
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
                <div className="relative">
                  {item.name === "Notificações" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 inline-flex min-w-[16px] h-3.5 px-[3px] items-center justify-center bg-red-500 text-white rounded-full text-[9px] leading-none">
                      {formatBadgeCount(unreadCount)}
                    </span>
                  )}
                  {item.name === "Chat" && chatUnread > 0 && (
                    <span className="absolute -top-1.5 -right-2 inline-flex min-w-[16px] h-3.5 px-[3px] items-center justify-center bg-emerald-600 text-white rounded-full text-[9px] leading-none">
                      {formatBadgeCount(chatUnread)}
                    </span>
                  )}
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
                </div>
                <span className="text-[10px] leading-none">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
