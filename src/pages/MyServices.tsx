import { useState, useEffect } from "react";
import { Pencil, Trash2, TrendingUp, Plus, MoreVertical, BarChart3, Eye, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/AppLayout";
import { PublishServiceModal } from "@/components/PublishServiceModal";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch, getCompanies, getCompanyServices, getCompanyServiceStats, Service, Company, API_BASE_URL, deleteService, promoteService } from "@/lib/api";
import { useHome } from "@/contexts/HomeContext";


export default function MyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; active: number; promoted: number; views: number } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const { user } = useHome();

  const loadServices = async () => {
    const companyId = (user?.companies && user.companies[0]?.id) || companies[0]?.id;
    if (!companyId) return;
    try {
      const [servicesData, statsData] = await Promise.all([
        getCompanyServices(companyId),
        getCompanyServiceStats(companyId)
      ]);
      setServices(servicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleEditService = (serviceId: number) => {
    navigate(`/edit-service/${serviceId}`);
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      await deleteService(serviceId);
      toast({
        title: "Sucesso",
        description: "Serviço eliminado com sucesso!",
      });
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Falha ao eliminar serviço",
        variant: "destructive",
      });
    }
  };

  const handlePromoteService = async (serviceId: number, promote: boolean) => {
    try {
      await promoteService(serviceId, promote);
      toast({
        title: "Sucesso",
        description: `Serviço ${promote ? 'promovido' : 'despromovido'} com sucesso!`,
      });
      loadServices();
    } catch (error) {
      console.error('Error promoting service:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar promoção do serviço",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.companies && user.companies.length > 0) {
          setCompanies(user.companies as unknown as Company[]);
          const companyId = user.companies[0].id;
          const [servicesData, statsData] = await Promise.all([
            getCompanyServices(companyId),
            getCompanyServiceStats(companyId)
          ]);
          setServices(servicesData);
          setStats(statsData);
        } else {
          const companiesData = await getCompanies();
          setCompanies(companiesData);
          if (companiesData.length > 0) {
            const companyId = companiesData[0].id;
            const [servicesData, statsData] = await Promise.all([
              getCompanyServices(companyId),
              getCompanyServiceStats(companyId)
            ]);
            setServices(servicesData);
            setStats(statsData);
          } else {
            setStats({ total: 0, active: 0, promoted: 0, views: 0 });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar serviços.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, user]);

  const handleModalChange = (open: boolean) => {
    setIsPublishModalOpen(open);
    if (!open && companies.length > 0) {
      // Reload services when modal closes
      loadServices();
    }
  };

  const toAbsolute = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const handleToggleStatus = async (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      const newStatus = service.status === "Ativo" ? "Pausado" : "Ativo";
      const updatedService = await apiFetch(`/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          status: newStatus
        }),
      });
      
      setServices(services.map(s => 
        s.id === serviceId ? updatedService : s
      ));

      toast({
        title: `Serviço ${newStatus.toLowerCase()}`,
        description: `O serviço foi ${newStatus.toLowerCase()} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do serviço.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Meus Serviços</h1>
            <p className="text-muted-foreground text-sm">Gerencie e promova os seus serviços</p>
          </div>
          <Button 
            onClick={() => setIsPublishModalOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>

        {/* Mobile-First Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-lg font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="rounded-lg font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Serviços
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
                      <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-blue-700">Total</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-900">{stats ? stats.total : services.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                      <Eye className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-green-700">Ativos</p>
                      <p className="text-xl md:text-2xl font-bold text-green-900">
                        {stats ? stats.active : services.filter(s => s.status === "Ativo").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-purple-500 rounded-xl shadow-lg">
                      <Star className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-purple-700">Promovidos</p>
                      <p className="text-xl md:text-2xl font-bold text-purple-900">
                        {stats ? stats.promoted : services.filter(s => s.is_promoted === 1).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-orange-500 rounded-xl shadow-lg">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-orange-700">Visualizações</p>
                      <p className="text-xl md:text-2xl font-bold text-orange-900">
                        {stats ? stats.views : services.reduce((acc, s) => acc + ((s as any).views || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => setIsPublishModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Serviço
                  </Button>
                  <Button variant="outline" className="border-dashed">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Promover Tudo
                  </Button>
                  <Button variant="outline" className="border-dashed">
                    <Eye className="h-4 w-4 mr-2" />
                    Analisar Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services List Tab */}
          <TabsContent value="services" className="space-y-4 mt-6">

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
                <p className="text-muted-foreground mb-4">Comece por publicar o seu primeiro serviço</p>
                <Button 
                  onClick={() => setIsPublishModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar Primeiro Serviço
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Service Image */}
                        <div className="w-full md:w-32 h-24 md:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={toAbsolute(service.image_url)}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Service Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h3 className="text-base md:text-lg font-semibold">{service.title}</h3>
                                <Badge variant={service.status === "Ativo" ? "default" : "secondary"} className="text-xs">
                                  {service.status}
                                </Badge>
                                {Boolean((service as any).is_promoted) && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 text-xs">
                                    ⭐ Promovido
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {service.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="bg-muted px-2 py-1 rounded">{service.category}</span>
                                <span className="font-medium text-primary">{service.price} MT</span>
                              </div>
                            </div>

                            {/* Action Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:ml-2">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditService(service.id)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(service.id)}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  {service.status === "Ativo" ? "Pausar" : "Activar"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePromoteService(service.id, !Boolean((service as any).is_promoted))}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {Boolean((service as any).is_promoted) ? "Remover Promoção" : "Promover"}
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza de que deseja eliminar este serviço? Esta acção não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteService(service.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Service Stats */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{(service as any).views || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{(service as any).leads || 0} leads</span>
                              </span>
                            </div>
                            <span>{new Date(service.created_at).toLocaleDateString('pt-PT')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Publish Service Modal */}
        <PublishServiceModal 
          open={isPublishModalOpen}
          onOpenChange={handleModalChange}
        />

        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}