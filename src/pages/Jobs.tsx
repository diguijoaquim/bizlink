import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getJobs, 
  type Job,
  toggleLike,
  getLikesInfo,
  API_BASE_URL
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { 
  Briefcase, 
  MapPin, 
  Eye, 
  Star,
  Plus,
  Search,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { useHome } from '../contexts/HomeContext';


const DEFAULT_AVATAR = 'https://www.skyvenda.com/avatar.png';
const toAbsolute = (url?: string) => (url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : undefined);

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobLikes, setJobLikes] = useState<Record<number, { isLiked: boolean; likesCount: number }>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasCompany, currentCompany } = useHome();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await getJobs({ status_filter: 'Ativa' });
      setJobs(jobsData);
      
      // Load likes for each job
      const likesPromises = jobsData.map(async (job) => {
        try {
          const likeInfo = await getLikesInfo('job', job.id);
          return { jobId: job.id, likeInfo };
        } catch (error) {
          console.error(`Error loading likes for job ${job.id}:`, error);
          return { jobId: job.id, likeInfo: { is_liked: false, likes_count: 0 } };
        }
      });
      
      const likesResults = await Promise.all(likesPromises);
      const likesMap: Record<number, { isLiked: boolean; likesCount: number }> = {};
      likesResults.forEach(({ jobId, likeInfo }) => {
        likesMap[jobId] = {
          isLiked: likeInfo.is_liked,
          likesCount: likeInfo.likes_count
        };
      });
      setJobLikes(likesMap);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vagas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (jobId: number) => {
    try {
      const result = await toggleLike('job', jobId);
      
      setJobLikes(prev => {
        const current = prev[jobId] || { isLiked: false, likesCount: 0 };
        if ('message' in result) {
          // Like was removed
          return {
            ...prev,
            [jobId]: {
              isLiked: false,
              likesCount: Math.max(0, current.likesCount - 1)
            }
          };
        } else {
          // Like was added
          return {
            ...prev,
            [jobId]: {
              isLiked: true,
              likesCount: current.likesCount + 1
            }
          };
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir esta vaga",
        variant: "destructive"
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 px-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-full border-2 border-border focus:border-primary"
            />
          </div>

          {hasCompany && (
            <Button 
              onClick={() => navigate('/jobs/create')}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>


        {/* Jobs List */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma vaga encontrada
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou verifique mais tarde.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const posterName = (job as any).poster_name || (job as any).company_name || (job as any).company?.name || 'Empresa';
              const posterAvatar = toAbsolute((job as any).poster_avatar || (job as any).company_logo_url || (job as any).company?.logo_url);
              return (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-colors cursor-pointer border border-border bg-card"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <CardContent className="p-4">
                    {/* Título e pill Remoto */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground leading-snug pr-2">
                        {job.title}
                      </h3>
                      {job.remote_work && (
                        <Badge variant="outline" className="text-xs px-2 py-0 whitespace-nowrap">Remoto</Badge>
                      )}
                    </div>

                    {/* Empresa */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {posterAvatar ? (
                          <img src={posterAvatar} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }} alt={posterName} className="w-full h-full object-cover" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">{posterName}</span>
                    </div>

                    {/* Metas/badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.location && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                        {formatDate(job.created_at)}
                      </span>
                      {job.is_promoted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <Star className="h-3 w-3" /> Promovida
                        </span>
                      )}
                    </div>

                    {/* Rodapé: views/likes */}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views || 0}</span>
                      <span
                        className={`flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors ${jobLikes[job.id]?.isLiked ? 'text-red-500' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(job.id); }}
                      >
                        <Heart className={`h-3 w-3`} fill={jobLikes[job.id]?.isLiked ? 'currentColor' : 'none'} strokeWidth={jobLikes[job.id]?.isLiked ? 0 : 2} />
                        {jobLikes[job.id]?.likesCount || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
