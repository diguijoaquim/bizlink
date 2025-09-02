import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getJobs, 
  getCompanyJobs, 
  updateJobStatus, 
  toggleJobPromotion,
  deleteJob,
  type Job 
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Eye, 
  Star,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useHome } from '../contexts/HomeContext';

// Categorias específicas para vagas
const jobCategories = [
  "Todas", "Tecnologia", "Marketing", "Vendas", "Administração", 
  "Recursos Humanos", "Finanças", "Saúde", "Educação", "Construção",
  "Logística", "Design", "Engenharia", "Jurídico", "Turismo"
];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [filters, setFilters] = useState({
    location: '',
    remote_work: '',
    status: 'Ativa'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasCompany, currentCompany } = useHome();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters, searchQuery, selectedCategory]);

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

    // Filtro de categoria
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(job => {
        const description = job.description.toLowerCase();
        const title = job.title.toLowerCase();
        
        switch (selectedCategory) {
          case "Tecnologia":
            return description.includes('tecnologia') || description.includes('programação') || description.includes('desenvolvimento') || title.includes('dev') || title.includes('programador');
          case "Marketing":
            return description.includes('marketing') || description.includes('publicidade') || description.includes('comunicação');
          case "Vendas":
            return description.includes('vendas') || description.includes('comercial') || description.includes('atendimento');
          case "Administração":
            return description.includes('administração') || description.includes('gestão') || description.includes('coordenação');
          case "Recursos Humanos":
            return description.includes('recursos humanos') || description.includes('rh') || description.includes('seleção');
          case "Finanças":
            return description.includes('finanças') || description.includes('contabilidade') || description.includes('financeiro');
          case "Saúde":
            return description.includes('saúde') || description.includes('médico') || description.includes('enfermagem');
          case "Educação":
            return description.includes('educação') || description.includes('ensino') || description.includes('formação');
          case "Construção":
            return description.includes('construção') || description.includes('obra') || description.includes('arquitetura');
          case "Logística":
            return description.includes('logística') || description.includes('transporte') || description.includes('distribuição');
          case "Design":
            return description.includes('design') || description.includes('criativo') || description.includes('arte');
          case "Engenharia":
            return description.includes('engenharia') || description.includes('técnico') || description.includes('projeto');
          case "Jurídico":
            return description.includes('jurídico') || description.includes('advocacia') || description.includes('legal');
          case "Turismo":
            return description.includes('turismo') || description.includes('hotelaria') || description.includes('viagem');
          default:
            return true;
        }
      });
    }

    // Filtros adicionais
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.remote_work !== '') {
      filtered = filtered.filter(job => 
        filters.remote_work === 'true' ? job.remote_work : !job.remote_work
      );
    }

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    setFilteredJobs(filtered);
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await updateJobStatus(jobId, newStatus);
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      toast({
        title: "Sucesso",
        description: `Status da vaga alterado para ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da vaga",
        variant: "destructive"
      });
    }
  };

  const handlePromotionToggle = async (jobId: number) => {
    try {
      const updatedJob = await toggleJobPromotion(jobId);
      setJobs(jobs.map(job => 
        job.id === jobId ? updatedJob : job
      ));
      toast({
        title: "Sucesso",
        description: updatedJob.is_promoted ? "Vaga promovida!" : "Promoção removida",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a promoção da vaga",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast({
        title: "Sucesso",
        description: "Vaga deletada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a vaga",
        variant: "destructive"
      });
    }
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

        {/* Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Categorias</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {jobCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-gradient-primary text-white border-0"
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros Avançados
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Localização</label>
                  <Input
                    placeholder="Ex: Maputo"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Trabalho Remoto</label>
                  <Select value={filters.remote_work} onValueChange={(value) => setFilters({ ...filters, remote_work: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground text-center">
          {filteredJobs.length} vaga{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
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
              const isOwner = !!currentCompany && job.company_id === currentCompany.id;
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      {/* Capa/ícone à esquerda */}
                      <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-10 w-10 text-muted-foreground" />
                      </div>
                      {/* Conteúdo central */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate">{job.title}</h3>
                          {job.is_promoted && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Promovida
                            </Badge>
                          )}
                          <Badge variant={job.status === 'Ativa' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          {isOwner && (
                            <Badge variant="outline">Minha vaga</Badge>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                          )}
                          <span>Publicada em {formatDate(job.created_at)}</span>
                        </div>
                      </div>
                      {/* Lado direito: métricas e ações */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{job.views}</span>
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{job.applications}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>Ver Detalhes</Button>
                          {isOwner && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Alterar Status da Vaga</DialogTitle>
                                    <DialogDescription>Escolha o novo status para esta vaga.</DialogDescription>
                                  </DialogHeader>
                                  <div className="flex gap-2">
                                    {['Ativa', 'Pausada', 'Fechada'].map((status) => (
                                      <Button key={status} variant={job.status === status ? 'default' : 'outline'} onClick={() => handleStatusChange(job.id, status)}>
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm" onClick={() => handlePromotionToggle(job.id)}>
                                {job.is_promoted ? 'Remover Promoção' : 'Promover'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>Tem certeza que deseja deletar esta vaga? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>Deletar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
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
