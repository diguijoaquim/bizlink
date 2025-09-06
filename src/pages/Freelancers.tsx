import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, MapPin, Search, ArrowLeft, Star } from 'lucide-react';
import { getFreelancerProfile, searchFreelancers, type FreelancerProfile } from '@/lib/api';

export default function Freelancers() {
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [filtered, setFiltered] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Buscar perfis (usa busca sem filtros para listar)
        const data = await searchFreelancers({ limit: 50 });
        setProfiles(data);
        setFiltered(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (!term) { setFiltered(profiles); return; }
    setFiltered(profiles.filter(p =>
      (p.title || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.location || '').toLowerCase().includes(term)
    ));
  }, [q, profiles]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar freelancers..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-12 rounded-full border-2 border-border focus:border-primary" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          {filtered.length} freelancer{filtered.length !== 1 ? 'es' : ''}
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-28 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-10 text-center">Nenhum freelancer encontrado.</CardContent></Card>
          ) : filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">{p.title || 'Freelancer'}</h3>
                      <Badge variant="outline">{p.currency}/h {p.hourly_rate || 0}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {p.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{p.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Star className="h-4 w-4" />{p.rating?.toFixed(1)}</span>
                      <span>Projetos {p.completed_projects}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/@${(p as any).user?.email?.split('@')[0] || ''}`)}>
                      Ver Perfil
                    </Button>
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


