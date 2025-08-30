import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MapPin, Globe, Mail, Phone, Link as LinkIcon, Building2, Star } from "lucide-react";
import { apiFetch, API_BASE_URL, deleteService, promoteService } from "@/lib/api";
import { ProfileServiceCard } from "@/components/ProfileServiceCard";
import { useToast } from "@/hooks/use-toast";
import { useHome } from "@/contexts/HomeContext";

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
    currentCompany 
  } = useHome();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

  if (userLoading) {
    return (
      <AppLayout>
        <p>Carregando...</p>
      </AppLayout>
    );
  }

  const firstCompany = currentCompany;
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

  function onPickCover() {
    coverInputRef.current?.click();
  }
  function onPickLogo() {
    logoInputRef.current?.click();
  }

  // Perfil usa exclusivamente as imagens da empresa (logo/capa)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho estilizado */}
        <div className="relative bizlink-animate-fade-in">
          <div className="relative h-32 md:h-48 rounded-xl overflow-hidden bg-gradient-soft">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Capa (preview)"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : firstCompany?.cover_url ? (
              <img
                src={toAbsolute(firstCompany.cover_url)}
                alt="Capa da empresa"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute top-4 right-4">
              <Button onClick={hasCompany ? onPickCover : undefined} variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative px-4 -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background shadow-bizlink-soft bg-gradient-soft overflow-hidden flex items-center justify-center text-lg font-bold relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo (preview)" className="w-full h-full object-cover" />
                  ) : firstCompany?.logo_url ? (
                    <img src={toAbsolute(firstCompany.logo_url)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}</span>
                  )}
                  {hasCompany ? (
                    <button
                      onClick={onPickLogo}
                      className="absolute bottom-1 right-1 bg-background/90 rounded-full p-1 shadow"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
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
                          {firstCompany?.district || "—"}
                          {firstCompany?.province ? `, ${firstCompany.province}` : ""}
                        </span>
                      </div>
                      {firstCompany?.nuit && (
                        <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                          <Building2 className="h-3.5 w-3.5 mr-1" /> NUIT: {firstCompany.nuit}
                        </div>
                      )}
                    </div>
                  </div>
                  {!hasCompany ? (
                    <Button 
                      onClick={() => navigate('/create-company')} 
                      className="bg-gradient-primary text-white border-0"
                    >
                      Adicionar empresa
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/edit-company')} 
                      className="bg-gradient-primary text-white border-0"
                    >
                      Editar empresa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasCompany ? (
          <Tabs defaultValue="about" className="bizlink-animate-slide-up w-full">
            <TabsList className="w-full">
              <TabsTrigger value="about" className="flex-1">Sobre</TabsTrigger>
              <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
              <TabsTrigger value="my-services" className="flex-1">Meus Serviços</TabsTrigger>
            </TabsList>
                          <TabsContent value="about" className="mt-4 w-full">
                <div className="space-y-6 w-full">
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
                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
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
              </div>
            </TabsContent>
            <TabsContent value="portfolio" className="mt-4 w-full">
              <div className="space-y-6 w-full">
                {/* Cabeçalho do Portfolio */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Portfolio da Empresa</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Apresente os seus melhores trabalhos e projetos para impressionar potenciais clientes.
                  </p>
                </div>

                {/* Grid de Projetos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Projeto 1 - Placeholder */}
                  <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors group">
                    <div className="aspect-video bg-gradient-soft rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Imagem do Projeto</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Nome do Projeto</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Descrição breve do projeto e dos resultados alcançados.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Categoria</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Design</span>
                    </div>
                  </div>

                  {/* Projeto 2 - Placeholder */}
                  <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors group">
                    <div className="aspect-video bg-gradient-soft rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Imagem do Projeto</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Outro Projeto</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Exemplo de outro projeto realizado com sucesso para um cliente.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Categoria</span>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">Desenvolvimento</span>
                    </div>
                  </div>

                  {/* Botão Adicionar Projeto */}
                  <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border-2 border-dashed border-border hover:border-primary/30 transition-colors group cursor-pointer">
                    <div className="aspect-video bg-gradient-soft rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <span className="text-2xl text-primary">+</span>
                        </div>
                        <p className="text-sm text-primary font-medium">Adicionar Projeto</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Novo Projeto</h4>
                    <p className="text-sm text-muted-foreground">
                      Clique para adicionar um novo projeto ao seu portfolio.
                    </p>
                  </div>
                </div>

                {/* Ações do Portfolio */}
                <div className="bg-card rounded-xl p-6 bizlink-shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Gerir Portfolio</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Adicionar Projeto
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-secondary/20 hover:bg-secondary/5 hover:border-secondary/40"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Reordenar Projetos
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-muted-foreground/20 hover:bg-muted-foreground/5"
                    >
                      Configurações
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="my-services" className="mt-4 w-full">
              <div className="space-y-4 w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Meus Serviços</h3>
                  <Button onClick={() => navigate('/my-services')} className="bg-gradient-primary text-white border-0">
                    Gerir Serviços
                  </Button>
                </div>
                
                {servicesLoading ? (
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
          </Tabs>
        ) : (
          <div className="bg-card rounded-xl p-6 bizlink-shadow-soft">
            <p className="text-muted-foreground">Sugestão: clique em "Adicionar empresa" para começar.</p>
          </div>
        )}

        {/* Hidden inputs for image picking */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) updateCompanyImage("cover", file);
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
            if (file) updateCompanyImage("logo", file);
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