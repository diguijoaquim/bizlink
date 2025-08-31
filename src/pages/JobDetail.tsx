import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getCompanies, type Job, type Company } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Eye, 
  Star,
  Calendar,
  Edit,
  Briefcase,
  Globe,
  Building
} from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const jobData = await getJob(parseInt(id));
      setJob(jobData);
      
      // Carregar dados da empresa
      const companies = await getCompanies();
      const jobCompany = companies.find(c => c.id === jobData.company_id);
      if (jobCompany) {
        setCompany(jobCompany);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da vaga",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-800 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vaga não encontrada
              </h3>
              <p className="text-gray-600">
                A vaga que você está procurando não existe ou foi removida.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Vagas
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              {job.is_promoted && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Promovida
                </Badge>
              )}
              <Badge variant={job.status === 'Ativa' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
            </div>
            
            {company && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span className="font-medium">{company.name}</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => navigate(`/jobs/edit/${job.id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Vaga
          </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Vaga */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição da Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              {job.description ? (
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              ) : (
                <p className="text-gray-500 italic">Nenhuma descrição fornecida.</p>
              )}
            </CardContent>
          </Card>



          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{job.views}</span>
                  </div>
                  <p className="text-sm text-gray-600">Visualizações</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{job.applications}</span>
                  </div>
                  <p className="text-sm text-gray-600">Candidaturas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Localização</p>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
              )}



              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Trabalho Remoto</p>
                  <p className="text-sm text-gray-600">
                    {job.remote_work ? 'Disponível' : 'Não disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle>Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Publicada em</p>
                  <p className="text-sm text-gray-600">{formatDateTime(job.created_at)}</p>
                </div>
              </div>



              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última atualização</p>
                  <p className="text-sm text-gray-600">{formatDateTime(job.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Ver Candidatos
              </Button>
              
              <Button className="w-full" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                {job.is_promoted ? 'Remover Promoção' : 'Promover Vaga'}
              </Button>
              
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Vaga
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
