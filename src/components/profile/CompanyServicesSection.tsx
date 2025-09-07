import { Button } from "@/components/ui/button";
import { ProfileServiceCard } from "@/components/ProfileServiceCard";

interface CompanyServicesSectionProps {
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    category: string;
    tags: string[];
    postedAt: string;
    is_promoted?: boolean;
  }>;
  loading: boolean;
  onManage: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string, promote: boolean) => void;
}

export function CompanyServicesSection({ services, loading, onManage, onEdit, onDelete, onPromote }: CompanyServicesSectionProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Meus Serviços</h3>
        <Button onClick={onManage} className="bg-gradient-primary text-white border-0">
          Gerir Serviços
        </Button>
      </div>
      {loading && services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-3">
          {services.map((service) => (
            <ProfileServiceCard 
              key={service.id} 
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Ainda não tem serviços publicados</p>
          <Button onClick={onManage} className="bg-gradient-primary text-white border-0">
            Publicar Primeiro Serviço
          </Button>
        </div>
      )}
    </div>
  );
}
