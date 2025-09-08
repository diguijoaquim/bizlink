import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, ArrowLeft, SquarePen, Download, Image as ImageIcon, FileText, File as FileIcon, Mic, Square, X, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/Skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { searchUsers, type User, getCompanies, type Company, getUserByIdPublic, getConversations, getMessages, sendMessage, startConversation, type ConversationListItem, type ChatMessageItem, getRecipients, connectChatWS, getCurrentUserId, markConversationRead, sendMessageFile } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

 
 
// WaveSurfer-based audio player (card style)
function ChatWavePlayer({ src, lightText, avatarUrl }: { src: string; lightText?: boolean; avatarUrl?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dur, setDur] = useState(0);
  const [curr, setCurr] = useState(0);
  const isDraggingRef = useRef(false);

  // Draw static bars and progress overlay on a small canvas (SoundCloud-style)
  const barWidth = 2;
  const barGap = 1;
  const barRadius = 2;
  const height = 26;
  // Colors adapt to background: if it's my message (lightText), use white bars
  const waveColor = lightText ? 'rgba(255,255,255,0.55)' : '#4F4A85';
  const progressColor = lightText ? 'rgba(255,255,255,0.95)' : '#383351';

  const seededRandom = (seed: number) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  };

  const drawBars = (progressRatio = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width / (Math.max(1, window.devicePixelRatio || 1));
    ctx.clearRect(0, 0, width, height);
    const numBars = Math.floor(width / (barWidth + barGap));
    // pseudo-random, seeded by src hash
    const hash = Array.from(src).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    const rnd = seededRandom(Math.abs(hash));

    const drawBar = (x: number, h: number, color: string) => {
      const y = (height - h) / 2;
      const r = Math.min(barRadius, barWidth / 2, h / 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      // rounded rect
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + h - r);
      ctx.quadraticCurveTo(x + barWidth, y + h, x + barWidth - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    const maxH = height * 0.9;
    const minH = height * 0.2;
    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + barGap);
      const h = Math.max(minH, rnd() * maxH);
      drawBar(x, h, waveColor);
    }

    // overlay progress
    const progressX = Math.floor(progressRatio * width);
    if (progressX > 0) {
      // Clip and redraw bars in progress color
      const rnd2 = seededRandom(Math.abs(hash));
      const clipNumBars = Math.ceil(progressX / (barWidth + barGap));
      for (let i = 0; i < clipNumBars; i++) {
        const x = i * (barWidth + barGap);
        const h = Math.max(minH, rnd2() * maxH);
        drawBar(x, h, progressColor);
      }
    }
  };

  useEffect(() => {
    const a = new Audio();
    a.src = src;
    a.preload = 'metadata';
    audioRef.current = a;

    const onLoaded = () => { const d = Number.isFinite(a.duration) ? a.duration : 0; setDur(d); drawBars(0); };
    const onDuration = () => { const d = Number.isFinite(a.duration) ? a.duration : 0; if (d && d !== dur) setDur(d); };
    const onTime = () => { const t = Number.isFinite(a.currentTime) ? a.currentTime : 0; const d = Number.isFinite(a.duration) ? a.duration : dur; setCurr(t); drawBars(d > 0 ? t / d : 0); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('durationchange', onDuration);
    a.addEventListener('canplay', onDuration);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);

    // Load metadata only (no autoplay).
    try { a.load(); } catch {}

    // initial canvas size (once)
    const c = canvasRef.current;
    if (c) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = c.clientWidth || 144;
      c.width = Math.floor(cssW * dpr);
      c.height = Math.floor(height * dpr);
      c.style.height = `${height}px`;
      const ctx = c.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      drawBars(0);
    }

    return () => {
      try { a.pause(); } catch {}
      a.src = '';
      audioRef.current = null;
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('durationchange', onDuration);
      a.removeEventListener('canplay', onDuration);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [src]);

  // Scrub on click/drag
  useEffect(() => {
    const c = canvasRef.current;
    const a = audioRef.current;
    if (!c || !a) return;
    const getRatio = (clientX: number) => {
      const rect = c.getBoundingClientRect();
      const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
      return rect.width > 0 ? x / rect.width : 0;
    };
    const onDown = (e: MouseEvent) => { isDraggingRef.current = true; const r = getRatio(e.clientX); if (dur > 0) { a.currentTime = r * dur; drawBars(r); } };
    const onMove = (e: MouseEvent) => { if (!isDraggingRef.current) return; const r = getRatio(e.clientX); if (dur > 0) { a.currentTime = r * dur; drawBars(r); } };
    const onUp = () => { isDraggingRef.current = false; };
    c.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      c.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dur]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { try { a.play().catch(()=>{}); } catch {} } else { try { a.pause(); } catch {} }
  };

  const fmt = (val: number) => {
    const s = Number.isFinite(val) && val > 0 ? val : 0;
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className={`rounded-xl ${lightText ? 'bg-white/15' : 'bg-card'} p-2 w-[220px] max-w-full shadow-sm border border-border/50`}> 
      <div className="flex items-center gap-2">
        <button onClick={toggle} disabled={!audioRef.current} className={`h-7 w-7 rounded-full grid place-items-center text-white ${lightText ? 'bg-white/30' : 'bg-gradient-to-br from-indigo-500 to-violet-500'} shadow`}>{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button>
        <div className="relative flex-1">
          <canvas ref={canvasRef} className="w-36 cursor-pointer" />
        </div>
        {avatarUrl && (
          <img src={avatarUrl} className="h-8 w-8 rounded-full object-cover border border-white/20" />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px]">
        <span className={`${lightText ? 'text-white/80' : 'text-muted-foreground'}`}>{fmt(curr)}</span>
        <Mic className={`${lightText ? 'text-white/80' : 'text-muted-foreground'} h-3 w-3`} />
        <span className={`${lightText ? 'text-white/80' : 'text-muted-foreground'}`}>{fmt(dur)}</span>
      </div>
    </div>
  );
}

export default function Messages() {
  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  const isAudioUrl = (url: string) => /\.(mp3|wav|ogg|webm)(\?|$)/i.test(url);
  const isPdfUrl = (url: string) => /\.(pdf)(\?|$)/i.test(url);
  const getFileKind = (m: ChatMessageItem): 'image'|'video'|'audio'|'file' => {
    const ct = (m.content_type || '').toLowerCase();
    if (ct.startsWith('audio/')) return 'audio';
    if (ct.startsWith('video/')) return 'video';
    if (ct.startsWith('image/')) return 'image';
    const t = (m.text || '').toLowerCase();
    if (t.startsWith('http')) {
      // Prefer audio first for webm/ogg ambiguity
      if (isAudioUrl(t)) return 'audio';
      if (isVideoUrl(t)) return 'video';
      if (isImageUrl(t)) return 'image';
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
      if (isAudioUrl(lower)) return { label: 'Áudio' };
      if (isVideoUrl(lower)) return { label: 'Vídeo' };
      return { label: 'Arquivo', icon: <FileIcon className="h-3.5 w-3.5" /> };
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

  // Emoji picker state
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const EMOJI_LIST: { name: string; char: string }[] = [
    { name: 'smile', char: '😄' },
    { name: 'heart_eyes', char: '😍' },
    { name: 'thumbs_up', char: '👍' },
    { name: 'clap', char: '👏' },
    { name: 'fire', char: '🔥' },
    { name: 'party_popper', char: '🎉' },
    { name: 'cry', char: '😢' },
    { name: 'angry', char: '😠' },
    { name: 'heart', char: '❤️' },
    { name: 'ok_hand', char: '👌' },
    { name: 'raised_hands', char: '🙌' },
    { name: 'rocket', char: '🚀' },
    { name: 'microphone', char: '🎤' },
    { name: 'camera', char: '📷' },
    { name: 'paperclip', char: '📎' },
  ];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showEmoji) return;
      const target = e.target as Node;
      if (
        emojiPickerRef.current && !emojiPickerRef.current.contains(target) &&
        emojiButtonRef.current && !emojiButtonRef.current.contains(target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showEmoji]);

  const pickEmoji = (em: { name: string; char: string }) => {
    setNewMessage((prev) => (prev || '') + em.char);
    setShowEmoji(false);
  };

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordTimerRef = useRef<number | null>(null as any);

  // State for reply-to message
  const [replyTo, setReplyTo] = useState<{ id: number; preview: string } | null>(null);

  const [imageViewSrc, setImageViewSrc] = useState<string | null>(null);
  const openImage = (src: string) => setImageViewSrc(src);
  const closeImage = () => setImageViewSrc(null);

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

  // Audio recording handlers
  const startRecording = async () => {
    if (!selectedChat || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
          const filename = `audio_${Date.now()}.webm`;
          const file = new File([blob], filename, { type: blob.type });
          const cid = parseInt(selectedChat!, 10);
          setUploading(true);
          const res = await sendMessageFile(cid, file, { reply_to_id: replyTo?.id ?? undefined });
          setChatMessages(prev => [...prev, { id: res.id, text: res.url, time: new Date().toISOString(), isMe: true, type: 'file', filename, content_type: blob.type, reply_to_id: replyTo?.id ?? null, reply_to_preview: replyTo?.preview ?? null }]);
          clearReply();
        } catch (e) {
          console.error('audio upload failed', e);
        } finally {
          setUploading(false);
        }
      };
      rec.start(100);
      recorderRef.current = rec;
      setIsRecording(true);
      setRecordMs(0);
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = window.setInterval(() => setRecordMs((ms) => ms + 100), 100);
    } catch (e) {
      console.error('mic permission or recorder error', e);
    }
  };

  const stopRecording = () => {
    try {
      recorderRef.current?.stop();
      recorderRef.current?.stream.getTracks().forEach(t => t.stop());
    } catch {}
    setIsRecording(false);
    if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
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
            <div className={`${isMobile ? 'fixed top-0' : 'sticky top-0'} left-0 right-0 z-20 bg-card p-3 border-b border-border flex items-center justify-between`} style={isMobile ? { position: 'fixed', top: 0 } : undefined}>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft size={24} />
                </Button>
                <div className="relative">
                  <img
                    onClick={()=>navigate(`/profile/${selectedChatData.peer.id}`)}
                    src={selectedChatData.peer.profile_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                    alt={selectedChatData.peer.full_name || selectedChatData.peer.email}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1 min-w-0">
                    <button onClick={()=>navigate(`/profile/${selectedChatData.peer.id}`)} className="font-medium text-foreground truncate hover:underline text-left">
                      {selectedChatData.peer.full_name || selectedChatData.peer.email}
                    </button>
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
            <div className={`${isMobile ? 'overflow-y-scroll' : 'overflow-y-auto flex-1'} p-4 space-y-3 touch-auto`} style={isMobile ? { position: 'absolute', top: '60px', bottom: '70px', left: 0, right: 0, WebkitOverflowScrolling: 'touch' } : undefined}>
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
                  <div onDoubleClick={() => onMessageClick(message)} className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.isMe ? "bg-gradient-primary text-white" : "bg-muted text-foreground"}`}>
                    {message.reply_to_preview && (
                      <div className={`mb-1 px-2 py-1 rounded ${message.isMe ? 'bg-white/20' : 'bg-background/60'} text-xs italic line-clamp-1`}>↪ {message.reply_to_preview}</div>
                    )}
                    { (message.type === 'file' || message.content_type || message.text.startsWith('http')) ? (
                      (() => {
                        const kind = getFileKind(message);
                        if (kind === 'image') {
                          return (
                            <div className="space-y-1">
                              <img onClick={() => openImage(message.text)} src={message.text} alt={getDisplayName(message)} className="rounded-lg max-w-[70vw] max-h-64 object-cover cursor-zoom-in" />
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
                              <ChatWavePlayer src={message.text} lightText={message.isMe} avatarUrl={selectedChatData.peer.profile_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} />
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm break-all">
                              {(isPdfUrl(message.text) || (message.content_type||'').toLowerCase()==='application/pdf') ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <FileIcon className="h-4 w-4" />
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
              {isRecording && (
                <div className="mb-2 px-3 py-2 rounded border bg-muted text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Gravando áudio… {Math.floor(recordMs/1000)}s
                  </div>
                  <Button size="icon" variant="destructive" onClick={stopRecording}><Square className="h-4 w-4" /></Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleFilePick} disabled={uploading || isRecording}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <Button variant={isRecording?"destructive":"ghost"} size="icon" onClick={isRecording ? stopRecording : startRecording} disabled={uploading}>
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); sendTyping(); }}
                    className="pr-10"
                    disabled={isRecording}
                  />
                  <Button ref={emojiButtonRef} onClick={(e)=>{ e.stopPropagation(); setShowEmoji(v=>!v); }} variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                  {showEmoji && (
                    <div ref={emojiPickerRef} className="absolute right-0 bottom-10 z-50 bg-card border border-border rounded-lg p-2 shadow-md w-56">
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJI_LIST.map((em) => (
                          <button key={em.name} onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); pickEmoji(em); }} className="h-7 w-7" title={em.name}>
                            <img src={`https://emojiapi.dev/api/v1/${em.name}.svg`} alt={em.name} className="h-7 w-7" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleSend} className="bg-gradient-primary text-white border-0 hover:opacity-90" disabled={isRecording}>
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
      {imageViewSrc && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={closeImage}>
          <button className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow" onClick={(e)=>{ e.stopPropagation(); closeImage(); }}>
            <X className="h-5 w-5" />
          </button>
          <img src={imageViewSrc} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e)=>e.stopPropagation()} />
        </div>
      )}
    </>
  );

  return content;
}