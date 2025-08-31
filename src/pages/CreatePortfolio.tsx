import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createPortfolioItem, 
  updatePortfolioItem, 
  getPortfolioItem, 
  type CompanyPortfolio 
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { ArrowLeft, Save, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function CreatePortfolio() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    mediaFile: null as File | null,
    mediaPreview: ''
  });

  // Mock company ID - em produção, isso viria do contexto do usuário
  const companyId = 1;

  useEffect(() => {
    if (isEditing) {
      loadPortfolioItem();
    }
  }, [id]);

  const loadPortfolioItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const item = await getPortfolioItem(parseInt(id));
      setFormData({
        title: item.title,
        description: item.description || '',
        link: item.link || '',
        mediaFile: null,
        mediaPreview: item.media_url || ''
      });
    } catch (error) {
      console.error('Error loading portfolio item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o item do portfólio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('company_id', companyId.toString());
      
      if (formData.mediaFile) {
        formDataToSend.append('media_file', formData.mediaFile);
      }
      
      if (isEditing) {
        await updatePortfolioItem(parseInt(id!), formDataToSend);
        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso",
        });
      } else {
        await createPortfolioItem(formDataToSend);
        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso",
        });
      }
      
      navigate('/portfolio');
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      toast({
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o projeto" : "Não foi possível criar o projeto",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Tipo de arquivo não suportado. Use imagens, vídeos ou PDFs.",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Tamanho máximo: 10MB",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        mediaFile: file,
        mediaPreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeMedia = () => {
    setFormData(prev => ({
      ...prev,
      mediaFile: null,
      mediaPreview: ''
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
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
            onClick={() => navigate('/portfolio')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portfólio
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Projeto' : 'Adicionar Novo Projeto'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Atualize as informações do projeto' : 'Adicione um novo projeto ao portfólio da empresa'}
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
                <CardTitle>Informações do Projeto</CardTitle>
                <CardDescription>
                  Dados principais do projeto ou trabalho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Projeto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Website E-commerce"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva detalhadamente o projeto..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="link">Link do Projeto</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                    placeholder="https://exemplo.com/projeto"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Link para visualizar o projeto online (opcional)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Upload de Mídia */}
            <Card>
              <CardHeader>
                <CardTitle>Mídia do Projeto</CardTitle>
                <CardDescription>
                  Adicione uma imagem, vídeo ou PDF do projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview da mídia */}
                {formData.mediaPreview && (
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      {formData.mediaPreview.includes('data:') || formData.mediaPreview.includes('http') ? (
                        <img
                          src={formData.mediaPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeMedia}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload de arquivo */}
                <div>
                  <Label htmlFor="media">Arquivo de Mídia</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="media"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF, MP4, MOV, AVI, PDF (máx. 10MB)
                          </p>
                        </div>
                        <input
                          id="media"
                          type="file"
                          className="hidden"
                          accept="image/*,video/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Suporta imagens, vídeos e PDFs. Tamanho máximo: 10MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle>Dicas para um Bom Portfólio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use títulos claros e descritivos</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Inclua descrições detalhadas dos projetos</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Adicione links para projetos online quando possível</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use imagens de alta qualidade para mostrar o trabalho</p>
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
            onClick={() => navigate('/portfolio')}
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
            {saving ? 'Salvando...' : (isEditing ? 'Atualizar Projeto' : 'Criar Projeto')}
          </Button>
        </div>
      </form>
      </div>
    </AppLayout>
  );
}
