import { useRef, useState, useEffect } from "react";
import "@/styles/tabs.css";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MapPin, Globe, Mail, Phone, Link as LinkIcon, Building2, Star, Plus, Edit, Trash2, ExternalLink, Calendar, Image as ImageIcon, Briefcase, Eye, Star as StarIcon, MoreVertical } from "lucide-react";
import { apiFetch, API_BASE_URL, deleteService, promoteService, getCompanyPortfolio, deletePortfolioItem, uploadUserProfilePhoto, uploadUserCoverPhoto, type CompanyPortfolio } from "@/lib/api";
import { ProfileServiceCard } from "@/components/ProfileServiceCard";
import { useToast } from "@/hooks/use-toast";
import { useHome } from "@/contexts/HomeContext";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getMyJobs, type Job } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PortfolioItemCard, JobItemCard, ProfileTabsList, ProfileTabs } from "@/components/profile";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    user, 
    userLoading, 
    hasCompany, 
    services, 
    servicesLoading, 
    loadServices: reloadServices,
    currentCompany,
    refreshData
  } = useHome();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<CompanyPortfolio[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Verificar se o usuário precisa configurar o perfil
  const isPublicView = typeof window !== 'undefined' && (window.location.pathname.startsWith('/@') || new URLSearchParams(window.location.search).has('user_id'));
  const needsProfileSetup = (!user?.user_type || 
    user.user_type === 'simple' && !user.full_name ||
    !user?.province || 
    !user?.district) && !isPublicView;

  // Considerar perfil completo quando for empresa ou freelancer e possuir província e distrito
  const isProfileComplete = (
    (user?.user_type === 'company' && !!currentCompany?.province && !!currentCompany?.district) ||
    (user?.user_type === 'freelancer' && !!user?.province && !!user?.district)
  );

  const handleEditService = (serviceId: string) => {
    navigate(`/edit-service/${serviceId}`);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService(parseInt(serviceId));
      toast({
        title: "Sucesso",
        description: "Serviço eliminado com sucesso!",
      });
      reloadServices(); // Reload services
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Falha ao eliminar serviço",
        variant: "destructive",
      });
    }
  };

  const handlePromoteService = async (serviceId: string, promote: boolean) => {
    try {
      await promoteService(parseInt(serviceId), promote);
      toast({
        title: "Sucesso",
        description: `Serviço ${promote ? 'promovido' : 'despromovido'} com sucesso!`,
      });
      reloadServices(); // Reload services
    } catch (error) {
      console.error('Error promoting service:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar promoção do serviço",
        variant: "destructive",
      });
    }
  };

  // Portfolio functions
  const loadPortfolio = async () => {
    if (!currentCompany?.id) return;
    
    try {
      setPortfolioLoading(true);
      const items = await getCompanyPortfolio(currentCompany.id);
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o portfólio",
        variant: "destructive"
      });
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (itemId: number) => {
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

  // Load portfolio when company is available
  useEffect(() => {
    if (currentCompany?.id) {
      loadPortfolio();
    }
  }, [currentCompany?.id]);

  // Ensure services refresh when returning to this page (e.g., after editing a service cover)
  useEffect(() => {
    const refreshOnFocus = () => {
      reloadServices();
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [reloadServices]);

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      if (user?.user_type === 'company' && hasCompany) {
        try {
          setJobsLoading(true);
          const jobs = await getMyJobs();
          setMyJobs(jobs || []);
        } catch (e) {
          console.error('Erro ao carregar vagas:', e);
          setMyJobs([]);
        } finally {
          setJobsLoading(false);
        }
      }
    };
    loadJobs();
  }, [user?.user_type, hasCompany]);

  // Redirecionar para configuração de perfil se necessário
  // Removido redirecionamento automático para configuração de perfil
  // Mantemos apenas um aviso visual com opção de ir para configuração

  if (userLoading || !user) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    );
  }

  const firstCompany = currentCompany;
  const showingCompanyMedia = user?.user_type === 'company' && !!firstCompany;
  
  const toAbsolute = (url?: string) => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  async function updateCompanyImage(type: "cover" | "logo", file: File) {
    if (!firstCompany?.id) return;
    setSaving(true);
    setError(null);
    try {
      // show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      if (type === "cover") setCoverPreview(objectUrl);
      if (type === "logo") setLogoPreview(objectUrl);

      const form = new FormData();
      // Only send the file field; backend treats others as optional
      if (type === "cover") form.append("cover", file);
      if (type === "logo") form.append("logo", file);
      const endpoint = type === "cover"
        ? `/companies/${firstCompany.id}/cover`
        : `/companies/${firstCompany.id}/logo`;
      await apiFetch(endpoint, {
        method: "PUT",
        body: form,
      });
      // Refetch data using context
      await reloadServices();
      await refreshData();
    } catch (e: any) {
      setError(e?.message || "Falha ao atualizar imagem");
    } finally {
      setSaving(false);
      // cleanup preview after upload completes
      if (type === "cover" && coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      if (type === "logo" && logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
    }
  }

  async function updateUserImage(type: "cover" | "profile", file: File) {
    setSaving(true);
    setError(null);
    try {
      const objectUrl = URL.createObjectURL(file);
      if (type === "cover") setCoverPreview(objectUrl);
      if (type === "profile") setLogoPreview(objectUrl);

      if (type === "cover") {
        await uploadUserCoverPhoto(file);
      } else {
        await uploadUserProfilePhoto(file);
      }
      await refreshData();
    } catch (e: any) {
      setError(e?.message || "Falha ao atualizar imagem");
    } finally {
      setSaving(false);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
    }
  }

  function onPickCover() {
    coverInputRef.current?.click();
  }
  function onPickLogo() {
    logoInputRef.current?.click();
  }

  // Seleciona a fonte das imagens (empresa ou usuário)
  const resolvedCoverUrl = coverPreview
    ? coverPreview
    : (showingCompanyMedia ? toAbsolute(firstCompany?.cover_url) : toAbsolute(user?.cover_photo_url)) || null;
  const resolvedAvatarUrl = logoPreview
    ? logoPreview
    : (showingCompanyMedia ? toAbsolute(firstCompany?.logo_url) : toAbsolute(user?.profile_photo_url)) || null;

  return (
    <AppLayout>
      <div className="space-y-6 text-center md:text-left px-4">
        {/* Cabeçalho estilizado */}
        <div className="relative bizlink-animate-fade-in">
          <div className="relative h-32 md:h-48 rounded-xl overflow-hidden bg-gradient-soft">
            {resolvedCoverUrl ? (
              <img
                src={resolvedCoverUrl}
                alt="Capa"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            {!isPublicView && (
              <div className="absolute top-4 right-4">
                <Button onClick={onPickCover} variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="relative px-4 -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background shadow-bizlink-soft bg-gradient-soft overflow-hidden flex items-center justify-center text-lg font-bold relative">
                  {resolvedAvatarUrl ? (
                    <img src={resolvedAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}</span>
                  )}
                  {!isPublicView && (
                    <button
                      onClick={onPickLogo}
                      className="absolute bottom-1 right-1 bg-background/90 rounded-full p-1 shadow"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {firstCompany?.name || user?.full_name || user?.email}
                    </h1>
                    <div className="flex items-center text-muted-foreground mt-2 gap-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {user?.user_type === 'company' ? 
                            `${firstCompany?.district || "—"}${firstCompany?.province ? `, ${firstCompany.province}` : ""}` :
                            `${user?.district || "—"}${user?.province ? `, ${user.province}` : ""}`
                          }
                        </span>
                      </div>
                      {firstCompany?.nuit && (
                        <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                          <Building2 className="h-3.5 w-3.5 mr-1" /> NUIT: {firstCompany.nuit}
                        </div>
                      )}
                    </div>
                  </div>
                  {!isPublicView && (
                    <div className="flex items-center gap-2">
                      {isProfileComplete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate('/profile-setup')} 
                          aria-label="Editar Perfil"
                          title="Editar Perfil"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ação para configurar perfil (sem mensagem descritiva) */}
        {!isPublicView && !userLoading && user && !isProfileComplete && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-end">
              <Button 
                onClick={() => navigate('/profile-setup')}
                className="bg-gradient-primary text-white border-0"
              >
                Configurar Perfil
              </Button>
            </div>
          </div>
        )}

        {/* Renderização condicional baseada no tipo de usuário */}
        {user?.user_type === 'company' && hasCompany ? (
          <div className="">
            <ProfileTabs
              defaultValue="about"
              items={[
                { value: 'about', label: 'Sobre' },
                { value: 'portfolio', label: 'Portfolio' },
                { value: 'my-services', label: 'Meus Serviços' },
                { value: 'my-jobs', label: 'Minhas Vagas' },
              ]}
              columns={4}
            >
              <TabsContent value="about" className="profile-tabs-content">
                <div className="space-y-6 w-full mx-auto max-w-2xl md:max-w-4xl">
                  {/* Descrição da Empresa */}
                  {firstCompany?.description && (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Sobre a Empresa</h3>
                      <p className="text-muted-foreground leading-relaxed">{firstCompany.description}</p>
                    </div>
                  )}

                  {/* Cards de Informação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Card de Contato */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Contato</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                            {firstCompany?.email || user?.email || "—"}
                          </span>
                        </div>
                        {firstCompany?.whatsapp && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">WhatsApp</span>
                            <a 
                              href={`https://wa.me/${firstCompany.whatsapp.replace(/[^\d]/g, "")}`} 
                              target="_blank" 
                              className="text-sm font-medium text-green-600 hover:underline"
                            >
                              {firstCompany.whatsapp}
                            </a>
                          </div>
                        )}
                        {firstCompany?.website && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Website</span>
                            <a 
                              href={firstCompany.website.startsWith("http") ? firstCompany.website : `http://${firstCompany.website}`} 
                              target="_blank" 
                              className="text-sm font-medium text-primary hover:underline truncate max-w-[120px]"
                            >
                              {firstCompany.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card de Localização */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                          <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Localização</h3>
                      </div>
                      <div className="space-y-3">
                        {firstCompany?.address && (
                          <div>
                            <span className="text-xs text-muted-foreground">Endereço</span>
                            <p className="text-sm font-medium text-foreground mt-1">{firstCompany.address}</p>
                          </div>
                        )}
                        {(firstCompany?.district || firstCompany?.province) && (
                          <div>
                            <span className="text-xs text-muted-foreground">Região</span>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {firstCompany?.district || ""}{firstCompany?.province ? `, ${firstCompany.province}` : ""}
                            </p>
                          </div>
                        )}
                        {firstCompany?.nationality && (
                          <div>
                            <span className="text-xs text-muted-foreground">País</span>
                            <p className="text-sm font-medium text-foreground mt-1">{firstCompany.nationality}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card de Informações Legais */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                          <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Nome da Empresa</span>
                          <p className="text-sm font-medium text-foreground mt-1">{firstCompany?.name || "—"}</p>
                        </div>
                        {firstCompany?.nuit && (
                          <div>
                            <span className="text-xs text-muted-foreground">NUIT</span>
                            <p className="text-sm font-medium text-foreground mt-1 font-mono">{firstCompany.nuit}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-muted-foreground">Criado em</span>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {firstCompany?.created_at ? new Date(firstCompany.created_at).toLocaleDateString('pt-PT') : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  {!isPublicView ? (
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline" 
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                          onClick={() => navigate(`/@${(user?.email || '').split('@')[0]}`)}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Ver Página Pública
                        </Button>
                        <Button 
                          onClick={() => navigate('/my-services')} 
                          className="bg-gradient-primary text-white border-0 hover:opacity-90"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Gerir Serviços
                        </Button>
                        <Button 
                          onClick={() => navigate('/edit-company')} 
                          variant="outline"
                          className="border-secondary/20 hover:bg-secondary/5 hover:border-secondary/40"
                        >
                          Editar Empresa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Sobre esta empresa</h3>
                      <p className="text-sm text-muted-foreground">Conecte-se, peça um orçamento ou veja mais serviços.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="portfolio" className="profile-tabs-content">
                <div className="space-y-6 w-full mx-auto max-w-2xl md:max-w-4xl">
                  {/* Cabeçalho do Portfolio */}
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                    <h3 className="text-lg font-semibold text-foreground">Portfólios</h3>
                  </div>

                  {/* Loading State */}
                  {portfolioLoading && portfolioItems.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border animate-pulse">
                          <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded mb-3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grid de Projetos (apenas capa e título) */}
                  {portfolioItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolioItems.slice(0, 12).map((item) => (
                        <PortfolioItemCard key={item.id} item={item} onEdit={(id)=>navigate(`/portfolio/edit/${id}`)} onDelete={handleDeletePortfolioItem} />
                      ))}
                    </div>
                  )}

                  {/* Estado Vazio */}
                  {!portfolioLoading && portfolioItems.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nenhum projeto no portfolio
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Comece adicionando seu primeiro projeto para mostrar seu trabalho.
                      </p>
                      <Button 
                        onClick={() => navigate('/portfolio/create')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        arpoi Primeiro Projeto
                      </Button>
                    </div>
                  )}

                  {/* Ações do Portfolio */}
                  {portfolioItems.length > 0 && (
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Gerir Portfolio</h3>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline" 
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                          onClick={() => navigate('/portfolio/create')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Projeto
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-secondary/20 hover:bg-secondary/5 hover:border-secondary/40"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Reordenar Projetos
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="my-services" className="profile-tabs-content">
                <div className="space-y-4 w-full mx-auto max-w-2xl md:max-w-4xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Meus Serviços</h3>
                    <Button onClick={() => navigate('/my-services')} className="bg-gradient-primary text-white border-0">
                      Gerir Serviços
                    </Button>
                  </div>
                  
                  {servicesLoading && services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando serviços...</p>
                    </div>
                  ) : services.length > 0 ? (
                    <div className="space-y-3">
                      {services.map((service) => {
                        const transformedService = {
                          id: service.id.toString(),
                          title: service.title,
                          description: service.description,
                          price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
                          image: toAbsolute(service.image_url) || "/placeholder.svg",
                          category: service.category,
                          tags: service.tags ? (typeof service.tags === 'string' ? service.tags.replace(/[{}]/g, '').split(',').map(tag => tag.trim()).filter(Boolean) : []) : [],
                          postedAt: service.created_at ? new Date(service.created_at).toLocaleDateString('pt-PT') : "Hoje",
                          is_promoted: !!service.is_promoted,
                        };

                        return (
                          <ProfileServiceCard 
                            key={service.id} 
                            service={transformedService}
                            onEdit={handleEditService}
                            onDelete={handleDeleteService}
                            onPromote={(id, promote) => handlePromoteService(id, promote)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Ainda não tem serviços publicados</p>
                      <Button onClick={() => navigate('/my-services')} className="bg-gradient-primary text-white border-0">
                        Publicar Primeiro Serviço
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="my-jobs" className="profile-tabs-content">
                <div className="space-y-4 w-full mx-auto max-w-2xl md:max-w-4xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Minhas Vagas</h3>
                    <Button onClick={() => navigate('/jobs/create')} className="bg-gradient-primary text-white border-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Vaga
                    </Button>
                  </div>

                  {jobsLoading && myJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando vagas...</p>
                    </div>
                  ) : myJobs.length > 0 ? (
                    <div className="space-y-3">
                      {myJobs.map((job) => (
                        <JobItemCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Ainda não tem vagas publicadas</p>
                      <Button onClick={() => navigate('/jobs/create')} className="bg-gradient-primary text-white border-0">
                        Publicar Primeira Vaga
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </ProfileTabs>
          </div>
        ) : user?.user_type === 'freelancer' ? (
          <div className="">
            <ProfileTabs
              defaultValue="about"
              items={[
                { value: 'about', label: 'Sobre' },
                { value: 'portfolio', label: 'Portfolio' },
                { value: 'my-services', label: 'Meus Serviços' },
              ]}
              columns={3}
            >
              <TabsContent value="about" className="profile-tabs-content">
                <div className="space-y-6 w-full mx-auto max-w-2xl md:max-w-4xl">
                  {/* Descrição do Freelancer */}
                  {user?.bio && (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Sobre Mim</h3>
                      <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                    </div>
                  )}

                  {/* Cards de Informação do Freelancer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Card de Contato */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Contato</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                            {user?.email || "—"}
                          </span>
                        </div>
                        {user?.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">WhatsApp</span>
                            <a 
                              href={`https://wa.me/${user.phone.replace(/[^\d]/g, "")}`} 
                              target="_blank" 
                              className="text-sm font-medium text-green-600 hover:underline"
                            >
                              {user.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card de Localização */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                          <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Localização</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Região</span>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {user?.district || ""}{user?.province ? `, ${user.province}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card de Perfil */}
                    <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                          <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Perfil</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Nome Completo</span>
                          <p className="text-sm font-medium text-foreground mt-1">{user?.full_name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Tipo</span>
                          <p className="text-sm font-medium text-foreground mt-1">Freelancer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="portfolio" className="profile-tabs-content">
                <div className="text-center py-12 mx-auto max-w-2xl md:max-w-4xl">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Portfolio em desenvolvimento
                  </h3>
                  <p className="text-muted-foreground">
                    Funcionalidade de portfolio para freelancers será adicionada em breve.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="my-services" className="profile-tabs-content">
                <div className="space-y-4 w-full mx-auto max-w-2xl md:max-w-4xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Meus Serviços</h3>
                    <Button onClick={() => navigate('/my-services')} className="bg-gradient-primary text-white border-0">
                      Gerir Serviços
                    </Button>
                  </div>
                  
                  {servicesLoading && services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando serviços...</p>
                    </div>
                  ) : services.length > 0 ? (
                    <div className="space-y-3">
                      {services.map((service) => {
                        const transformedService = {
                          id: service.id.toString(),
                          title: service.title,
                          description: service.description,
                          price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
                          image: toAbsolute(service.image_url) || "/placeholder.svg",
                          category: service.category,
                          tags: service.tags ? (typeof service.tags === 'string' ? service.tags.replace(/[{}]/g, '').split(',').map(tag => tag.trim()).filter(Boolean) : []) : [],
                          postedAt: service.created_at ? new Date(service.created_at).toLocaleDateString('pt-PT') : "Hoje",
                          is_promoted: !!service.is_promoted,
                        };

                        return (
                          <ProfileServiceCard 
                            key={service.id} 
                            service={transformedService}
                            onEdit={handleEditService}
                            onDelete={handleDeleteService}
                            onPromote={(id, promote) => handlePromoteService(id, promote)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Ainda não tem serviços publicados</p>
                      <Button onClick={() => navigate('/my-services')} className="bg-gradient-primary text-white border-0">
                        Publicar Primeiro Serviço
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </ProfileTabs>
          </div>
        ) : (user?.user_type === 'simple') ? (
          <div className="bg-card rounded-xl p-6 bizlink-shadow-soft mx-auto max-w-2xl md:max-w-4xl">
            <div className="space-y-6 w-full">
              {/* Informações do Usuário Simples */}
              {!isPublicView && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Perfil Simples</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Você tem um perfil simples no BizLink. Para acessar mais funcionalidades, considere criar uma empresa ou se tornar um freelancer.
                  </p>
                </div>
              )}

              {/* Cards de Informação do Usuário Simples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card de Contato */}
                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Contato</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                        {user?.email || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Nome</span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                        {user?.full_name || "—"}
                      </span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Telefone</span>
                        <a 
                          href={`tel:${user.phone}`}
                          className="text-sm font-medium text-primary hover:underline truncate max-w-[120px]"
                        >
                          {user.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card de Localização */}
                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Localização</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Região</span>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {user?.district || ""}{user?.province ? `, ${user.province}` : ""}
                      </p>
                    </div>
                    {user?.nationality && (
                      <div>
                        <span className="text-xs text-muted-foreground">País</span>
                        <p className="text-sm font-medium text-foreground mt-1">{user.nationality}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sobre Mim */}
              {user?.bio && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Sobre Mim</h3>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Detalhes Pessoais e Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Detalhes Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Nome</span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[140px]">{user?.full_name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Gênero</span>
                      <span className="text-sm font-medium text-foreground">{user?.gender || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tipo</span>
                      <span className="text-sm font-medium text-foreground">Usuário simples</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Resumo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Estado</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                        {(() => { const anyUser: any = user as any; return anyUser?.is_active ? 'Ativo' : 'Inativo'; })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Membro desde</span>
                      <span className="text-sm font-medium text-foreground">
                        {(() => {
                          const anyUser: any = user as any;
                          return anyUser?.created_at ? new Date(anyUser.created_at).toLocaleDateString('pt-PT') : '—';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade actions removidas para manter visão clean do perfil simples */}
            </div>
          </div>
        ) : (!isPublicView ? (
          <div className="bg-card rounded-xl p-6 bizlink-shadow-soft mx-auto max-w-2xl md:max-w-4xl">
            <p className="text-muted-foreground">Configure seu perfil para começar a usar o BizLink.</p>
          </div>
        ) : null)}

        {/* Hidden inputs for image picking */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (showingCompanyMedia) {
                updateCompanyImage("cover", file);
              } else {
                updateUserImage("cover", file);
              }
            }
            if (coverInputRef.current) coverInputRef.current.value = "";
          }}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (showingCompanyMedia) {
                updateCompanyImage("logo", file);
              } else {
                updateUserImage("profile", file);
              }
            }
            if (logoInputRef.current) logoInputRef.current.value = "";
          }}
        />

        {saving && (
          <div className="text-xs text-muted-foreground">A guardar imagem...</div>
        )}
        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}

        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}