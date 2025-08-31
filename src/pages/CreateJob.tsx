import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createJob, 
  updateJob, 
  getJob, 
  getCompanies, 
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
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function CreateJob() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  useEffect(() => {
    loadCompanies();
    if (isEditing) {
      loadJob();
    }
  }, [id]);

  const loadCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
      if (companiesData.length > 0 && !isEditing) {
        setFormData(prev => ({ ...prev, company_id: companiesData[0].id }));
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
        await createJob(formData);
        toast({
          title: "Sucesso",
          description: "Vaga criada com sucesso",
        });
      }
      
      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar a vaga" : "Não foi possível criar a vaga",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof JobCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Vaga' : 'Criar Nova Vaga'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Atualize as informações da vaga' : 'Preencha os detalhes da nova vaga'}
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais da vaga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Empresa *</Label>
                  <Select 
                    value={formData.company_id.toString()} 
                    onValueChange={(value) => handleInputChange('company_id', parseInt(value))}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="title">Título da Vaga *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Desenvolvedor Full Stack"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva detalhadamente a vaga, incluindo requisitos, benefícios, salário, tipo de contrato, nível de experiência, etc..."
                    rows={6}
                    required
                  />
                </div>




              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Maputo, Moçambique"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote_work"
                    checked={formData.remote_work}
                    onCheckedChange={(checked) => handleInputChange('remote_work', checked)}
                  />
                  <Label htmlFor="remote_work">Trabalho remoto disponível</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">


            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status da Vaga</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>



                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_promoted"
                    checked={formData.is_promoted}
                    onCheckedChange={(checked) => handleInputChange('is_promoted', checked)}
                  />
                  <Label htmlFor="is_promoted">Promover esta vaga</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/jobs')}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Skeleton className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Salvando...' : (isEditing ? 'Atualizar Vaga' : 'Criar Vaga')}
          </Button>
        </div>
      </form>
      </div>
    </AppLayout>
  );
}
