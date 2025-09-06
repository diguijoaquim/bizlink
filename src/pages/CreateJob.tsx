import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createJob, 
  updateJob, 
  getJob, 
  getCompanies, 
  getAuthToken,
  type JobCreate, 
  type JobUpdate,
  type Company 
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { ArrowLeft, Save, Plus, Briefcase, MapPin } from 'lucide-react';
import { useHome } from '../contexts/HomeContext';

export default function CreateJob() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { user, hasCompany } = useHome();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [formData, setFormData] = useState<JobCreate>({
    company_id: 0,
    title: '',
    description: '',
    location: '',
    remote_work: false,
    status: 'Ativa',
    is_promoted: false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se usuário está autenticado
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar vagas",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    // Garantir que possui empresa para publicar vagas
    if (!hasCompany) {
      toast({
        title: 'Sem empresa',
        description: 'Apenas contas com empresa podem publicar vagas.',
        variant: 'destructive'
      });
      navigate('/companies');
      return;
    }

    loadCompanies();
    if (isEditing) {
      loadJob();
    }
  }, [id, navigate, toast]);

  const loadCompanies = async () => {
    try {
      // Preferir empresas do usuário logado
      if (user?.companies && user.companies.length > 0) {
        setCompanies(user.companies);
        if (!isEditing) {
          setFormData(prev => ({ ...prev, company_id: user.companies![0].id }));
        }
        return;
      }
      const companiesData = await getCompanies();
      const owned = user ? companiesData.filter(c => c.owner_id === user.id) : companiesData;
      setCompanies(owned);
      if (owned.length > 0 && !isEditing) {
        setFormData(prev => ({ ...prev, company_id: owned[0].id }));
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive"
      });
    }
  };

  const loadJob = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const job = await getJob(parseInt(id));
      setFormData({
        company_id: job.company_id,
        title: job.title,
        description: job.description,
        location: job.location || '',
        remote_work: job.remote_work,
        status: job.status,
        is_promoted: job.is_promoted
      });
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a vaga",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da vaga é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "A descrição da vaga é obrigatória",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await updateJob(parseInt(id!), formData as JobUpdate);
        toast({
          title: "Sucesso",
          description: "Vaga atualizada com sucesso",
        });
      } else {
        await createJob({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          remote_work: formData.remote_work,
          status: formData.status,
          is_promoted: formData.is_promoted,
          company_id: formData.company_id,
          image: imageFile || undefined
        });
        toast({
          title: "Sucesso",
          description: "Vaga criada com sucesso",
        });
      }
      
      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      
      let errorMessage = isEditing ? "Não foi possível atualizar a vaga" : "Não foi possível criar a vaga";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.includes('401') || error.message.includes('Not authenticated')) {
          errorMessage = "Sessão expirada. Faça login novamente.";
          // Redirecionar para login
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.message.includes('403')) {
          errorMessage = "Você não tem permissão para criar vagas.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof JobCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Moderno */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 hover:bg-white/80 backdrop-blur-sm border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                {isEditing ? 'Editar Vaga' : 'Criar Nova Vaga'}
              </h1>
              <p className="text-gray-600 text-lg">
                {isEditing ? 'Atualize as informações da vaga' : 'Preencha os detalhes da nova vaga'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Informações Básicas */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Informações Básicas</CardTitle>
                          <CardDescription className="text-gray-600">
                            Dados principais da vaga
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="company" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Empresa *
                          </Label>
                          <Select 
                            value={formData.company_id.toString()} 
                            onValueChange={(value) => handleInputChange('company_id', parseInt(value))}
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Selecione uma empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Título da Vaga *
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Ex: Desenvolvedor Full Stack"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Descrição *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descreva detalhadamente a vaga, incluindo requisitos, benefícios, salário, tipo de contrato, nível de experiência, etc..."
                          rows={6}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="image" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Imagem da Vaga
                        </Label>
                        <div className="space-y-4">
                          <div className="relative">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white hover:file:from-blue-600 hover:file:to-purple-700 h-12 border-gray-200"
                            />
                          </div>
                          {imagePreview && (
                            <div className="mt-4">
                              <div className="relative inline-block">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-40 h-40 object-cover rounded-2xl border-4 border-white shadow-lg"
                                />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Localização */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Localização</CardTitle>
                          <CardDescription className="text-gray-600">
                            Onde a vaga será executada
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Localização
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Ex: Maputo, Moçambique"
                          className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                        <Checkbox
                          id="remote_work"
                          checked={formData.remote_work}
                          onCheckedChange={(checked) => handleInputChange('remote_work', checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="remote_work" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Trabalho remoto disponível
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Esta vaga pode ser executada remotamente
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Configurações */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <CardTitle className="text-xl">Configurações</CardTitle>
                          <CardDescription className="text-gray-600">
                            Status e opções da vaga
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="status" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Status da Vaga
                        </Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativa">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Ativa
                              </div>
                            </SelectItem>
                            <SelectItem value="Pausada">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Pausada
                              </div>
                            </SelectItem>
                            <SelectItem value="Fechada">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Fechada
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <Checkbox
                          id="is_promoted"
                          checked={formData.is_promoted}
                          onCheckedChange={(checked) => handleInputChange('is_promoted', checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="is_promoted" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Promover esta vaga
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Destaque esta vaga para mais visualizações
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  className="h-14 px-8 border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      {isEditing ? 'Atualizar Vaga' : 'Criar Vaga'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
