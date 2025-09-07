import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, MessageCircle, Heart, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, getAuthToken, API_BASE_URL } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Notification {
  id: string;
  type: "message" | "like" | "follow" | "service" | "system";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case "like":
      return <Heart className="h-5 w-5 text-red-500" />;
    case "follow":
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case "service":
      return <Bell className="h-5 w-5 text-purple-500" />;
    case "system":
      return <CheckCircle className="h-5 w-5 text-primary" />;
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");
  const [startChatOpen, setStartChatOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load from API
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/notifications/?limit=50');
        setNotifications(
          (data as any[]).map(n => ({
            id: String(n.id),
            type: n.type,
            title: n.title,
            description: n.description,
            time: new Date(n.time).toLocaleString('pt-PT'),
            isRead: n.isRead,
          }))
        );
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    })();
  }, []);

  // WebSocket for realtime
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/notifications/ws?token=${encodeURIComponent(token)}`;
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg?.event === 'notification') {
            const n = msg.data as any;
            setNotifications(prev => [
              {
                id: String(n.id),
                type: n.type,
                title: n.title,
                description: n.description,
                time: new Date(n.time).toLocaleString('pt-PT'),
                isRead: false,
              },
              ...prev,
            ]);
          }
        } catch {}
      };
    } catch (e) {
      console.error('WS error', e);
    }
    return () => {
      try { socket?.close(); } catch {}
    };
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try { await apiFetch(`/notifications/${id}/read`, { method: 'POST' }); } catch {}
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await apiFetch(`/notifications/${id}`, { method: 'DELETE' }); } catch {}
  };

  const clearAll = async () => {
    setNotifications([]);
    try { await apiFetch(`/notifications/`, { method: 'DELETE' }); } catch {}
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "activity") return ["like", "follow", "service"].includes(notification.type);
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bizlink-animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas as notificações lidas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>Eliminar todas</Button>
            )}
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Notification Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bizlink-animate-slide-up">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              Todas
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Não lidas
              {unreadCount > 0 && (
                <Badge className="ml-1 bg-gradient-primary text-white border-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md bizlink-animate-fade-in ${
                      !notification.isRead 
                        ? "bg-gradient-soft border-primary/20" 
                        : "bg-card border-border"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon or Avatar */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <div className="relative">
                            <img
                              src={notification.avatar}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm mb-1 ${
                          !notification.isRead ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{notification.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <Button variant="ghost" size="sm" className="text-xs" onClick={(e)=>{ e.stopPropagation(); deleteNotification(notification.id); }}>Eliminar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}