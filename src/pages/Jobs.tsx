import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getJobs, 
  type Job 
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
  ArrowLeft
} from 'lucide-react';
import { useHome } from '../contexts/HomeContext';


export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="space-y-4">
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
        <div className="space-y-4">
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
               return (
                 <Card 
                   key={job.id} 
                   className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border shadow-sm bg-card hover:bg-muted/50 overflow-hidden"
                   onClick={() => navigate(`/jobs/${job.id}`)}
                 >
                   {/* Imagem da vaga */}
                   {job.image_url ? (
                     <div className="w-full h-48 overflow-hidden">
                       <img 
                         src={job.image_url} 
                         alt={job.title}
                         className="w-full h-full object-cover"
                       />
                     </div>
                   ) : (
                     <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                       <Briefcase className="h-16 w-16 text-white/80" />
                     </div>
                   )}
                   
                   <CardContent className="p-4">
                     <div className="flex gap-3 items-start">
                       {/* Logo da empresa */}
                       <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                         <Briefcase className="h-6 w-6 text-primary" />
                       </div>
                       
                       {/* Conteúdo principal */}
                       <div className="flex-1 min-w-0">
                         <div className="mb-2">
                           <h3 className="text-base font-semibold text-foreground mb-1 truncate">
                             {job.title}
                           </h3>
                           <p className="text-sm text-muted-foreground mb-2">
                             {(job as any).company_name || 'Empresa'}
                           </p>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             {job.location && (
                               <span className="flex items-center gap-1">
                                 <MapPin className="h-3 w-3" />
                                 {job.location}
                               </span>
                             )}
                             {job.remote_work && (
                               <Badge variant="outline" className="text-xs px-2 py-0">
                                 Remoto
                               </Badge>
                             )}
                           </div>
                         </div>
                         
                         {/* Mini info */}
                         <div className="flex items-center justify-between text-xs text-muted-foreground">
                           <span>{formatDate(job.created_at)}</span>
                           <div className="flex items-center gap-3">
                             <span className="flex items-center gap-1">
                               <Eye className="h-3 w-3" />
                               {job.views || 0}
                             </span>
                             {job.is_promoted && (
                               <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                 <Star className="h-3 w-3 mr-1" />
                                 Promovida
                               </Badge>
                             )}
                           </div>
                         </div>
                       </div>
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
