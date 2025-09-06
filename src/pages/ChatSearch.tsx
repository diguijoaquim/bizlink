import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { getRecipients, startConversation, type User, type Company } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export default function ChatSearch() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async (query?: string) => {
    setLoading(true);
    try {
      const type = query && query.trim() ? 'all' : 'all';
      const data = await getRecipients({ type: type as any, q: query?.trim(), limit: 50 });
      setUsers(data.users || []);
      setCompanies(data.companies || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(q);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-card border-b">
        <div className="flex items-center gap-2 p-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <form onSubmit={onSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar pessoas e empresas" className="pl-10" />
          </form>
          <Button onClick={onSearch} variant="default">Buscar</Button>
        </div>
      </div>

      <div className="p-3 space-y-6">
        {loading && <div className="text-muted-foreground">Carregando…</div>}

        {companies.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Empresas</h3>
            <div className="divide-y border rounded-lg">
              {companies.map((c) => (
                <div key={c.id} className="p-3 flex items-center gap-3" onClick={() => navigate('/messages?filter=company') }>
                  <img src={c.logo_url || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.description || 'Empresa'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Usuários</h3>
            <div className="divide-y border rounded-lg">
              {users.map((u) => (
                <div key={u.id} className="p-3 flex items-center gap-3" onClick={() => navigate('/messages?filter=all') }>
                  <img src={u.profile_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.full_name || u.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.user_type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
