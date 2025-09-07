import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, ArrowLeft, SquarePen, Download, Image as ImageIcon, FileText, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/Skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { searchUsers, type User, getCompanies, type Company, getUserByIdPublic, getConversations, getMessages, sendMessage, startConversation, type ConversationListItem, type ChatMessageItem, getRecipients, connectChatWS, getCurrentUserId, markConversationRead, sendMessageFile } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

 
 
export default function Messages() {
  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  const isAudioUrl = (url: string) => /\.(mp3|wav|ogg)(\?|$)/i.test(url);
  const isPdfUrl = (url: string) => /\.(pdf)(\?|$)/i.test(url);
  const getFileKind = (m: ChatMessageItem): 'image'|'video'|'audio'|'file' => {
    const ct = (m.content_type || '').toLowerCase();
    if (ct.startsWith('image/')) return 'image';
    if (ct.startsWith('video/')) return 'video';
    if (ct.startsWith('audio/')) return 'audio';
    const t = (m.text || '').toLowerCase();
    if (t.startsWith('http')) {
      if (isImageUrl(t)) return 'image';
      if (isVideoUrl(t)) return 'video';
      if (isAudioUrl(t)) return 'audio';
    }
    return (m.type === 'file') ? 'file' : 'file';
  };
  const getDisplayName = (m: ChatMessageItem) => m.filename || (m.text?.split('/')?.pop()?.split('?')[0] || 'Arquivo');

  // Format last message for chat list preview
  const formatLastMessagePreview = (value?: string): { label: string; icon?: JSX.Element } => {
    const v = (value || '').trim();
    if (!v) return { label: '' };
    const lower = v.toLowerCase();
    if (lower.startsWith('http')) {
      if (isImageUrl(lower)) return { label: 'Imagem', icon: <ImageIcon className="h-3.5 w-3.5" /> };
      if (isPdfUrl(lower)) return { label: 'PDF', icon: <FileText className="h-3.5 w-3.5" /> };
      if (isVideoUrl(lower)) return { label: 'Vídeo' };
      if (isAudioUrl(lower)) return { label: 'Áudio' };
      return { label: 'Arquivo', icon: <File className="h-3.5 w-3.5" /> };
    }
    return { label: v };
  };

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
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
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null as any);
  const [replyTo, setReplyTo] = useState<{ id: number; preview: string } | null>(null);

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
    const openId = params.get('open');
    if (openId) {
      const cid = parseInt(openId, 10);
      if (Number.isFinite(cid)) {
        handleOpenChat(cid);
      }
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

  // Auto open first conversation on desktop only
  useEffect(() => {
    if (!isMobile && chats.length > 0 && !selectedChat) {
      handleOpenChat(chats[0].id);
    }
  }, [isMobile, chats, selectedChat]);

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
      await handleOpenChat(id);
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
    window.dispatchEvent(new CustomEvent('chat:active', { detail: chatId }));
    window.dispatchEvent(new Event('chat:clear-unread'));
    try { await markConversationRead(chatId); } catch {}
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0, last_message_is_unread: false } : c));
    setChatMessages(await getMessages(chatId));
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
            if (!isMine && String(m.conversation_id ?? chatId) === String(chatId)) {
              setChatMessages(prev => [...prev, { id: m.id, text: m.text, time: m.time, isMe: false, type: m.type, filename: m.filename, content_type: m.content_type }]);
              window.dispatchEvent(new Event('chat:clear-unread'));
            }
          } else if (msg?.event === 'typing') {
            setIsPeerTyping(true);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => setIsPeerTyping(false), 1500);
          }
        } catch {}
      };
      socket.onclose = () => { setWs(null); };
      setWs(socket);
    }
  };

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sendTyping = () => {
    try { ws?.send(JSON.stringify({ event: 'typing' })); } catch {}
  };

  const handleFilePick = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!selectedChat) return;
    const cid = parseInt(selectedChat, 10);
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const res = await sendMessageFile(cid, f, { reply_to_id: replyTo?.id ?? undefined });
      setChatMessages(prev => [...prev, { id: res.id, text: res.url, time: new Date().toISOString(), isMe: true, type: 'file', filename: f.name, content_type: f.type, reply_to_id: replyTo?.id ?? null, reply_to_preview: replyTo?.preview ?? null }]);
      clearReply();
    } catch (err) {
      console.error('file send failed', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = async () => {
    if (!selectedChat || !newMessage.trim()) return;
    const cid = parseInt(selectedChat, 10);
    try {
      const text = newMessage.trim();
      setNewMessage("");
      setChatMessages(prev => [...prev, { id: Date.now(), text, time: new Date().toISOString(), isMe: true, type: 'text', reply_to_id: replyTo?.id ?? null, reply_to_preview: replyTo?.preview ?? null }]);
      await sendMessage(cid, text, { reply_to_id: replyTo?.id });
      setChats(prev => prev.map(c => c.id === cid ? { ...c, last_message: text, last_time: new Date().toISOString() } : c));
      clearReply();
    } catch (e) {
      console.error('send failed', e);
    }
  };

  const onMessageClick = (m: ChatMessageItem) => {
    setReplyTo({ id: m.id, preview: m.text });
  };

  const clearReply = () => setReplyTo(null);

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

  useEffect(() => {
    // Add viewport meta tag to prevent keyboard from pushing fixed elements
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover, height=device-height';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    return () => {
      // leaving page clears active chat id
      window.dispatchEvent(new CustomEvent('chat:active', { detail: null }));
    };
  }, []);

  useEffect(() => {
    // entering messages page clears global chat badge
    window.dispatchEvent(new Event('chat:clear-unread'));
  }, []);

  const content = (
    <>
      <div className={`${isMobile ? 'h-[100dvh]' : 'h-screen'} flex flex-col md:flex-row bg-card ${isMobile ? 'rounded-xl' : ''} overflow-hidden overscroll-none bizlink-shadow-soft min-h-0 touch-none`}>
        {/* Chat List */}
        <div className={`border-b md:border-r border-border flex flex-col min-h-0 overflow-hidden ${selectedChat ? 'hidden md:flex md:w-1/3' : 'flex w-full md:w-1/3'}`}>
          {/* Chat List Header */}
          <div className="p-4 border-b border-border sticky top-0 z-10 bg-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => { if (window.history.length > 1) { window.history.back(); } else { window.location.assign('/'); } }}>
                  <ArrowLeft size={24} />
                </Button>
                <h1 className="text-xl font-bold gradient-text">Mensagens</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={openStartChat}>
                <SquarePen className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto touch-auto">
            <Tabs defaultValue="conversations" className="h-full">
              <TabsContent value="conversations" className="h-full">
                <div className="p-3">
                  <div className="relative" role="button" onClick={()=>navigate('/chat-search')}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <div className="pl-10 h-11 rounded-full bg-muted text-muted-foreground flex items-center">
                      <span className="text-sm">Pesquisar conversas</span>
                    </div>
                  </div>
                </div>
                {chatLoading ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!chatLoading && chats.length === 0) ? (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-muted-foreground">Você ainda não tem conversas.</p>
                    <Button onClick={openStartChat} className="bg-gradient-primary text-white border-0">Iniciar chat</Button>
                  </div>
                ) : (
                  chats.map((chat) => (
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
                      {(() => {
                        const p = formatLastMessagePreview(chat.last_message);
                        return (
                          <p className={`text-sm truncate flex-1 ${chat.last_message_is_unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {p.icon && <span className="inline-flex items-center mr-1 align-middle">{p.icon}</span>}
                            {p.label}
                          </p>
                        );
                      })()}
                      {chat.unread_count && chat.unread_count > 0 && (
                        <span className="ml-2 inline-flex min-w-[18px] h-5 px-1 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                          {chat.unread_count > 9 ? '9+' : chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                )))
                }
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
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-card p-3 border-b border-border flex items-center justify-between" style={{ position: 'fixed', top: 0 }}>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft size={24} />
                </Button>
                <div className="relative">
                  <img
                    src={selectedChatData.peer.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                    alt={selectedChatData.peer.full_name || selectedChatData.peer.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{selectedChatData.peer.full_name || selectedChatData.peer.email}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPeerTyping ? 'Digitando…' : 'Conversa'}
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
            <div className="overflow-y-scroll p-4 space-y-3 touch-auto" style={{ position: 'absolute', top: '60px', bottom: '70px', left: 0, right: 0, WebkitOverflowScrolling: 'touch' }}>
              {chatMessages.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${i % 2 === 0 ? "bg-muted" : "bg-primary/10"}`}>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>    
              ) : (
                chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                  <div onClick={() => onMessageClick(message)} className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.isMe ? "bg-gradient-primary text-white" : "bg-muted text-foreground"}`}>
                    {message.reply_to_preview && (
                      <div className={`mb-1 px-2 py-1 rounded ${message.isMe ? 'bg-white/20' : 'bg-background/60'} text-xs italic line-clamp-1`}>↪ {message.reply_to_preview}</div>
                    )}
                    { (message.type === 'file' || message.content_type || message.text.startsWith('http')) ? (
                      (() => {
                        const kind = getFileKind(message);
                        if (kind === 'image') {
                          return (
                            <div className="space-y-1">
                              <img src={message.text} alt={getDisplayName(message)} className="rounded-lg max-w-[70vw] object-contain" />
                              <a href={message.text} download className={`inline-flex items-center gap-1 text-xs ${message.isMe ? 'text-white/80' : 'text-foreground'} underline`}><Download className="h-3 w-3" />Baixar</a>
                            </div>
                          );
                        }
                        if (kind === 'video') {
                          return (
                            <div className="space-y-1">
                              <video src={message.text} controls className="rounded-lg max-w-[70vw]" />
                              <a href={message.text} download className={`inline-flex items-center gap-1 text-xs ${message.isMe ? 'text-white/80' : 'text-foreground'} underline`}><Download className="h-3 w-3" />Baixar</a>
                            </div>
                          );
                        }
                        if (kind === 'audio') {
                          return (
                            <div className="space-y-1">
                              <audio src={message.text} controls className="w-64" />
                              <a href={message.text} download className={`inline-flex items-center gap-1 text-xs ${message.isMe ? 'text-white/80' : 'text-foreground'} underline`}><Download className="h-3 w-3" />Baixar</a>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm break-all">
                              {(isPdfUrl(message.text) || (message.content_type||'').toLowerCase()==='application/pdf') ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                              <span>{getDisplayName(message)}</span>
                            </div>
                            <a href={message.text} download className={`inline-flex items-center gap-1 text-xs ${message.isMe ? 'text-white/80' : 'text-foreground'} underline`}><Download className="h-3 w-3" />Baixar</a>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm break-words">{message.text}</p>
                    )}
                    <p className={`text-xs mt-1 ${message.isMe ? "text-white/70" : "text-muted-foreground"}`}>
                      {new Date(message.time).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-card p-4 border-t border-border" style={{ position: 'fixed', bottom: 0 }}>
              {replyTo && (
                <div className="mb-2 px-3 py-2 rounded border bg-muted text-xs flex items-center justify-between">
                  <div className="truncate">Respondendo: {replyTo.preview}</div>
                  <Button size="icon" variant="ghost" onClick={clearReply}><X className="h-4 w-4" /></Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleFilePick} disabled={uploading}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); sendTyping(); }}
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
    </>
  );

  return content;
}