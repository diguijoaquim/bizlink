import { Image as ImageIcon, Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CompanyPortfolio } from "@/lib/api";

interface PortfolioItemCardProps {
  item: CompanyPortfolio;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function PortfolioItemCard({ item, onEdit, onDelete }: PortfolioItemCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 bizlink-shadow-soft border border-border hover:border-primary/20 transition-colors">
      <div className="grid grid-cols-[9rem,1fr] gap-3 items-stretch">
        <div className="w-full h-full min-h-[6rem] rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {item.media_url ? (
            <img
              src={item.media_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Sem Imagem</p>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate" title={item.title}>{item.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-muted">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(item.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
