import { useState, useEffect } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Users, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchUsers, type User } from "@/lib/api";

interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  unreadCount: number;
  isVerified: boolean;
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "TechSolutions Moçambique",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "Obrigado pelo interesse no nosso serviço!",
    time: "14:30",
    isOnline: true,
    unreadCount: 2,
    isVerified: true,
  },
  {
    id: "2",
    name: "Restaurante Sabor Local",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    lastMessage: "O catering está disponível para o dia 25",
    time: "12:45",
    isOnline: false,
    unreadCount: 0,
    isVerified: true,
  },
  {
    id: "3",
    name: "Clínica Saúde+",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
    lastMessage: "Pode marcar a consulta para segunda-feira",
    time: "11:20",
    isOnline: true,
    unreadCount: 1,
    isVerified: true,
  },
  {
    id: "4",
    name: "EduFuturo Academia",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "As inscrições para o novo curso já abriram",
    time: "09:15",
    isOnline: false,
    unreadCount: 0,
    isVerified: true,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Olá! Vi o vosso serviço de desenvolvimento de websites.",
    time: "14:25",
    isMe: true,
  },
  {
    id: "2", 
    text: "Olá! Obrigado pelo interesse. Como podemos ajudar?",
    time: "14:27",
    isMe: false,
  },
  {
    id: "3",
    text: "Gostaria de saber mais sobre os preços e prazos para um site de uma pequena empresa.",
    time: "14:28",
    isMe: true,
  },
  {
    id: "4",
    text: "Obrigado pelo interesse no nosso serviço! Vou enviar-lhe uma proposta detalhada por email.",
    time: "14:30",
    isMe: false,
    isRead: true,
  },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const selectedChatData = mockChats.find(chat => chat.id === selectedChat);

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await searchUsers({ limit: 50 });
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (query.trim()) {
      try {
        setUsersLoading(true);
        const usersData = await searchUsers({ query: query.trim(), limit: 50 });
        setUsers(usersData);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setUsersLoading(false);
      }
    } else {
      loadUsers();
    }
  };

  const startChatWithUser = (user: User) => {
    // Create a new chat with the selected user
    const newChat: Chat = {
      id: `user_${user.id}`,
      name: user.full_name || user.email,
      avatar: user.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      lastMessage: "Conversa iniciada",
      time: "Agora",
      isOnline: true,
      unreadCount: 0,
      isVerified: false,
    };
    
    // Add to mockChats if not already exists
    if (!mockChats.find(chat => chat.id === newChat.id)) {
      mockChats.unshift(newChat);
    }
    
    setSelectedChat(newChat.id);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex bg-card rounded-xl overflow-hidden bizlink-shadow-soft">
        {/* Chat List */}
        <div className="w-full md:w-1/3 border-r border-border flex flex-col">
          {/* Chat List Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground mb-3">Mensagens</h1>
            
            {/* Tabs for Conversations and Users */}
            <Tabs defaultValue="conversations" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversations" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversas
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuários
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversations" className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={userSearchQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="conversations" className="h-full">
              <TabsContent value="conversations" className="h-full">
                {mockChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted ${
                      selectedChat === chat.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {chat.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                            {chat.isVerified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {chat.lastMessage}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-gradient-primary text-white border-0 text-xs ml-2">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="users" className="h-full">
                {usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Carregando usuários...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Nenhum usuário encontrado</div>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startChatWithUser(user)}
                      className="p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={user.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                            alt={user.full_name || user.email}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-foreground truncate">
                              {user.full_name || user.email}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {user.user_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.bio || "Usuário do BizLink"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat && selectedChatData ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedChatData.avatar}
                    alt={selectedChatData.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChatData.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-medium text-foreground">{selectedChatData.name}</h3>
                    {selectedChatData.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedChatData.isOnline ? "Online" : "Visto há 1h"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isMe
                        ? "bg-gradient-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isMe ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="pr-10"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="bg-gradient-primary text-white border-0 hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20 md:h-0" />
    </AppLayout>
  );
}