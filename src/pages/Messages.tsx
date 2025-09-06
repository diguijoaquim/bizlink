import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Users, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { searchUsers, type User, getCompanies, type Company, getUserByIdPublic, getConversations, getMessages, sendMessage, startConversation, type ConversationListItem, type ChatMessageItem, getRecipients, connectChatWS, getCurrentUserId } from "@/lib/api";

 

export default function Messages() {
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<'all'|'company'|'freelancer'|'simple'>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [chats, setChats] = useState<ConversationListItem[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  const [recUsers, setRecUsers] = useState<User[]>([]);
  const [recCompanies, setRecCompanies] = useState<Company[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const selectedChatData = chats.find(chat => String(chat.id) === selectedChat);

  const location = useLocation();

  // Load users/companies when component mounts
  useEffect(() => {
    loadUsers();
    loadCompanies();
    loadConversations();
  }, []);

  // Apply filter from query string (?filter=company|freelancer|simple)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get('filter');
    if (f === 'company' || f === 'freelancer' || f === 'simple' || f === 'all') {
      setRecipientFilter(f as any);
    }
  }, [location.search]);

  // Reload according to recipientFilter
  useEffect(() => {
    if (recipientFilter === 'company') {
      loadCompanies();
    } else if (recipientFilter === 'freelancer') {
      (async () => {
        const data = await getRecipients({ type: 'freelancer', limit: 50 });
        setUsers(data.users || []);
      })();
    } else if (recipientFilter === 'simple') {
      (async () => {
        const data = await getRecipients({ type: 'simple', limit: 50 });
        setUsers(data.users || []);
      })();
    } else {
      loadUsers();
    }
  }, [recipientFilter]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      // Use recipients endpoint to allow filtering by type later
      const data = await getRecipients({ type: 'users', limit: 50 });
      setUsers(data.users || []);
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
        const typ = recipientFilter==='freelancer' ? 'freelancer' : recipientFilter==='simple' ? 'simple' : 'users';
        const data = await getRecipients({ type: typ as any, q: query.trim(), limit: 50 });
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setUsersLoading(false);
      }
    } else {
      loadUsers();
    }
  };

  const loadCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const data = await getRecipients({ type: 'companies', limit: 50 });
      setCompanies(data.companies || []);
    } catch (e) {
      console.error('Error loading companies:', e);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      setChatLoading(true);
      const data = await getConversations();
      setChats(data);
      if (data.length > 0) {
        setSelectedChat(String(data[0].id));
        const msgs = await getMessages(data[0].id);
        setChatMessages(msgs);
      }
    } catch (e) {
      console.error('Error loading conversations', e);
    } finally {
      setChatLoading(false);
    }
  };

  const startChatWithUser = (user: User) => {
    startConversation(user.id).then(async ({ id }) => {
      // Optimistically add conversation to list if missing
      setChats(prev => {
        if (prev.some(c => c.id === id)) return prev;
        const optimistic = {
          id,
          peer: { id: user.id, full_name: user.full_name, email: user.email, profile_photo_url: user.profile_photo_url },
          last_message: '',
          last_time: null as any,
        };
        return [optimistic, ...prev];
      });
      setSelectedChat(String(id));
      setChatMessages(await getMessages(id));
      // Refresh conversations in background to sync last_message
      loadConversations();
    }).catch(console.error);
  };

  const startChatWithCompany = async (company: Company) => {
    try {
      const owner = await getUserByIdPublic(company.owner_id);
      startChatWithUser(owner as unknown as User);
    } catch (e) {
      console.error('Failed to start chat with company owner', e);
    }
  };

  const handleOpenChat = async (chatId: number) => {
    setSelectedChat(String(chatId));
    setChatMessages(await getMessages(chatId));
    // connect websocket
    try { ws?.close(); } catch {}
    const socket = connectChatWS(chatId);
    if (socket) {
      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.event === 'message') {
            const m = msg.data;
            const myId = getCurrentUserId();
            const isMine = myId !== null && Number(m.sender_id) === Number(myId);
            // Ignore only if it's mine; also ensure message belongs to current conversation
            if (!isMine && String(m.conversation_id ?? chatId) === String(chatId)) {
              setChatMessages(prev => [...prev, { id: m.id, text: m.text, time: m.time, isMe: false }]);
            }
          }
        } catch {}
      };
      socket.onclose = () => { setWs(null); };
      setWs(socket);
    }
  };

  const handleSend = async () => {
    if (!selectedChat || !newMessage.trim()) return;
    const cid = parseInt(selectedChat, 10);
    try {
      const text = newMessage.trim();
      setNewMessage("");
      // optimistic own message primeiro
      setChatMessages(prev => [...prev, { id: Date.now(), text, time: new Date().toISOString(), isMe: true }]);
      await sendMessage(cid, text);
      // Atualizar o preview da última mensagem na lista de conversas
      setChats(prev => prev.map(c => c.id === cid ? { ...c, last_message: text, last_time: new Date().toISOString() } : c));
    } catch (e) {
      console.error('send failed', e);
    }
  };

  const openStartChat = async () => {
    try {
      setRecLoading(true);
      setStartOpen(true);
      const data = await getRecipients({ type: 'all', limit: 50 });
      setRecUsers(data.users || []);
      setRecCompanies(data.companies || []);
    } catch (e) {
      console.error('recipients failed', e);
      setRecUsers([]);
      setRecCompanies([]);
    } finally {
      setRecLoading(false);
    }
  };

  const content = (
      <div className={`${isMobile ? 'h-[calc(100vh-8rem)]' : 'h-screen'} flex flex-col md:flex-row bg-card ${isMobile ? 'rounded-xl' : ''} overflow-hidden bizlink-shadow-soft`}>
        {/* Chat List */}
        <div className={`border-b md:border-r border-border flex flex-col ${selectedChat ? 'hidden md:flex md:w-1/3' : 'flex w-full md:w-1/3'}`}>
          {/* Chat List Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground mb-3">Mensagens</h1>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="conversations" className="h-full">
              <TabsContent value="conversations" className="h-full">
                <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                </div>
                {(!chatLoading && chats.length === 0) && (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-muted-foreground">Você ainda não tem conversas.</p>
                    <Button onClick={openStartChat} className="bg-gradient-primary text-white border-0">Iniciar chat</Button>
          </div>
                )}
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleOpenChat(chat.id)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted ${
                      selectedChat === String(chat.id) ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={chat.peer.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                          alt={chat.peer.full_name || chat.peer.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-medium text-foreground truncate">{chat.peer.full_name || chat.peer.email}</h3>
                              </div>
                          <span className="text-xs text-muted-foreground">{chat.last_time ? new Date(chat.last_time).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}) : ''}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {chat.last_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="users" className="h-full">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={userSearchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  {/* Recipient type filter */}
                  <div className="flex gap-2 mt-3">
                    <Button variant={recipientFilter==='all'?'default':'outline'} size="sm" onClick={()=>setRecipientFilter('all')}>Todos</Button>
                    <Button variant={recipientFilter==='company'?'default':'outline'} size="sm" onClick={()=>setRecipientFilter('company')}>Empresas</Button>
                    <Button variant={recipientFilter==='freelancer'?'default':'outline'} size="sm" onClick={()=>setRecipientFilter('freelancer')}>Freelancers</Button>
                    <Button variant={recipientFilter==='simple'?'default':'outline'} size="sm" onClick={()=>setRecipientFilter('simple')}>Simples</Button>
                  </div>
                </div>
                {(recipientFilter==='company') ? (
                  companiesLoading ? (
                    <div className="flex items-center justify-center p-8"><div className="text-muted-foreground">Carregando empresas...</div></div>
                  ) : companies.length===0 ? (
                    <div className="flex items-center justify-center p-8"><div className="text-muted-foreground">Nenhuma empresa encontrada</div></div>
                  ) : (
                    companies.map((company)=> (
                      <div key={company.id} onClick={()=>startChatWithCompany(company)} className="p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted">
                        <div className="flex items-center gap-3">
                          <img src={company.logo_url || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'} className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-foreground truncate">{company.name}</h3>
                              <Badge variant="outline" className="text-xs">Empresa</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{company.description || 'Empresa'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Carregando usuários...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Nenhum usuário encontrado</div>
                  </div>
                ) : (
                  users
                    .filter(u => recipientFilter==='all' ? true : (recipientFilter==='freelancer' ? u.user_type==='freelancer' : recipientFilter==='simple' ? u.user_type==='simple' : true))
                    .map((user) => (
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
          <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedChatData.peer.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                    alt={selectedChatData.peer.full_name || selectedChatData.peer.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-medium text-foreground">{selectedChatData.peer.full_name || selectedChatData.peer.email}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Conversa
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
              {chatMessages.map((message) => (
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
                      {new Date(message.time).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}
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
                <Button onClick={handleSend} className="bg-gradient-primary text-white border-0 hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <p className="text-muted-foreground">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation (hidden on chat route due AppLayout hide) */}
      {isMobile && <div className="h-0" />}

      {/* Start Chat dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Iniciar conversa</DialogTitle>
            <DialogDescription>Selecione um destinatário (empresa, freelancer ou usuário).</DialogDescription>
          </DialogHeader>
          {recLoading ? (
            <div className="p-6 text-center text-muted-foreground">Carregando…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
              <div>
                <h3 className="text-sm font-semibold mb-2">Empresas</h3>
                {recCompanies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma empresa</p>
                ) : recCompanies.map((c) => (
                  <div key={c.id} onClick={() => { setStartOpen(false); startChatWithCompany(c); }} className="p-3 border rounded-lg cursor-pointer hover:bg-muted mb-2">
                    <div className="flex items-center gap-3">
                      <img src={c.logo_url || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'} className="w-9 h-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.description || 'Empresa'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Usuários</h3>
                {recUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum usuário</p>
                ) : recUsers.map((u) => (
                  <div key={u.id} onClick={() => { setStartOpen(false); startChatWithUser(u); }} className="p-3 border rounded-lg cursor-pointer hover:bg-muted mb-2">
                    <div className="flex items-center gap-3">
                      <img src={u.profile_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} className="w-9 h-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.full_name || u.email}</div>
                        <div className="text-xs text-muted-foreground">{u.user_type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
  );

  return isMobile ? (
    <AppLayout>{content}</AppLayout>
  ) : (
    content
  );
}