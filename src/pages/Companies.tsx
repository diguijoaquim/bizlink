import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Globe, Search, ArrowLeft, MoreVertical, Facebook, Linkedin, Instagram } from 'lucide-react';
import { startConversation, type Company, API_BASE_URL } from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHome } from '@/contexts/HomeContext';

export default function Companies() {
  const { companies, companiesLoaded, loadCompaniesOnce } = useHome();
  const [filtered, setFiltered] = useState<Company[]>([]);
  const loading = !companiesLoaded;
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => { loadCompaniesOnce(); }, [loadCompaniesOnce]);
  useEffect(() => { setFiltered(companies); }, [companies]);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (!term) { setFiltered(companies); return; }
    setFiltered(companies.filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.province || '').toLowerCase().includes(term) ||
      (c.district || '').toLowerCase().includes(term)
    ));
  }, [q, companies]);

  const toAbsolute = (url?: string | null) => {
    if (!url) return '/placeholder.svg';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  const toWebsite = (url?: string | null) => {
    if (!url) return undefined;
    return url.startsWith('http') ? url : `http://${url}`;
  };

  const getSiteIcon = (url?: string | null) => {
    if (!url) return <Globe className="h-4 w-4" />;
    const u = url.toLowerCase();
    if (u.includes('facebook.com')) return <Facebook className="h-4 w-4 text-blue-600" />;
    if (u.includes('linkedin.com')) return <Linkedin className="h-4 w-4 text-blue-700" />;
    if (u.includes('instagram.com')) return <Instagram className="h-4 w-4 text-pink-600" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar empresas..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-12 rounded-full border-2 border-border focus:border-primary" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          {filtered.length} empresa{filtered.length !== 1 ? 's' : ''}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-28 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-10 text-center">Nenhuma empresa encontrada.</CardContent></Card>
          ) : filtered.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0 avatar-company">
                    <img src={toAbsolute(c.logo_url)} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">{c.name}</h3>
                    </div>
                    {c.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {(c.district || c.province) && (
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.district}{c.province ? `, ${c.province}` : ''}</span>
                      )}
                      {c.website && (
                        <a href={toWebsite(c.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          {getSiteIcon(c.website)}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {isMobile ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/profile?user_id=${c.owner_id}`)}>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { try { const conv = await startConversation(c.owner_id); if (conv?.id) navigate(`/messages?open=${conv.id}`); } catch {} }}>Chat</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { try { window.alert('Denúncia recebida. Obrigado.'); } catch {} }}>Denunciar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile?user_id=${c.owner_id}`)}>
                        Ver Perfil
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}


