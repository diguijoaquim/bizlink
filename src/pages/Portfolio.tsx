import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCompanyPortfolio, 
  deletePortfolioItem,
  type CompanyPortfolio 
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Skeleton } from '../components/Skeleton';
import { AppLayout } from '../components/AppLayout';
import { 
  Image, 
  Link as LinkIcon, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Building
} from 'lucide-react';

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<CompanyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<CompanyPortfolio[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock company ID - em produção, isso viria do contexto do usuário
  const companyId = 1;

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    applySearch();
  }, [portfolioItems, searchTerm]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const items = await getCompanyPortfolio(companyId);
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o portfólio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredItems(portfolioItems);
      return;
    }

    const filtered = portfolioItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deletePortfolioItem(itemId);
      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
      toast({
        title: "Sucesso",
        description: "Item do portfólio deletado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o item",
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

  const getFileTypeIcon = (mediaUrl?: string) => {
    if (!mediaUrl) return <Image className="h-4 w-4" />;
    
    const extension = mediaUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    } else if (['mp4', 'mov', 'avi'].includes(extension || '')) {
      return <Image className="h-4 w-4" />; // Video icon
    } else if (extension === 'pdf') {
      return <Image className="h-4 w-4" />; // PDF icon
    }
    return <Image className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfólio da Empresa</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os projetos e trabalhos da sua empresa
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfólio da Empresa</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os projetos e trabalhos da sua empresa
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/portfolio/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Projeto
          </Button>
        </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            placeholder="Pesquisar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Lista de Itens do Portfólio */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto no portfólio'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa.' 
                  : 'Comece adicionando seu primeiro projeto ao portfólio.'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate('/portfolio/create')}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Projeto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Imagem/Mídia */}
                  <div className="lg:w-48 lg:flex-shrink-0">
                    {item.media_url ? (
                      <div className="relative group">
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {getFileTypeIcon(item.media_url)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        
                        {item.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.created_at)}
                          </div>
                          
                          {item.link && (
                            <div className="flex items-center gap-1">
                              <LinkIcon className="h-4 w-4" />
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                Ver projeto
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/portfolio/edit/${item.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar este item do portfólio? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      {portfolioItems.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Estatísticas do Portfólio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {portfolioItems.length}
                </div>
                <p className="text-sm text-gray-600">Total de Projetos</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {portfolioItems.filter(item => item.media_url).length}
                </div>
                <p className="text-sm text-gray-600">Com Mídia</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {portfolioItems.filter(item => item.link).length}
                </div>
                <p className="text-sm text-gray-600">Com Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AppLayout>
  );
}
