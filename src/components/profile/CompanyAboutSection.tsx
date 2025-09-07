import { Mail, MapPin, Building2 } from "lucide-react";

interface CompanyAboutSectionProps {
  description?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  address?: string | null;
  district?: string | null;
  province?: string | null;
  nationality?: string | null;
  nuit?: string | null;
  created_at?: string | null;
}

export function CompanyAboutSection(props: CompanyAboutSectionProps) {
  return (
    <div className="space-y-6 w-full">
      {props.description && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
          <h3 className="text-lg font-semibold text-foreground mb-3">Sobre a Empresa</h3>
          <p className="text-muted-foreground leading-relaxed">{props.description}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{props.email || "—"}</span>
            </div>
            {props.whatsapp && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">WhatsApp</span>
                <a href={`https://wa.me/${props.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" className="text-sm font-medium text-green-600 hover:underline">
                  {props.whatsapp}
                </a>
              </div>
            )}
            {props.website && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Website</span>
                <a href={props.website.startsWith("http") ? props.website : `http://${props.website}`} target="_blank" className="text-sm font-medium text-primary hover:underline truncate max-w-[120px]">
                  {props.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Localização</h3>
          </div>
          <div className="space-y-3">
            {props.address && (
              <div>
                <span className="text-xs text-muted-foreground">Endereço</span>
                <p className="text-sm font-medium text-foreground mt-1">{props.address}</p>
              </div>
            )}
            {(props.district || props.province) && (
              <div>
                <span className="text-xs text-muted-foreground">Região</span>
                <p className="text-sm font-medium text-foreground mt-1">{props.district || ""}{props.province ? `, ${props.province}` : ""}</p>
              </div>
            )}
            {props.nationality && (
              <div>
                <span className="text-xs text-muted-foreground">País</span>
                <p className="text-sm font-medium text-foreground mt-1">{props.nationality}</p>
              </div>
            )}
          </div>
        </div>
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
              <p className="text-sm font-medium text-foreground mt-1">{/* nome preenchido pela página */}</p>
            </div>
            {props.nuit && (
              <div>
                <span className="text-xs text-muted-foreground">NUIT</span>
                <p className="text-sm font-medium text-foreground mt-1 font-mono">{props.nuit}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Criado em</span>
              <p className="text-sm font-medium text-foreground mt-1">{props.created_at ? new Date(props.created_at).toLocaleDateString('pt-PT') : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
