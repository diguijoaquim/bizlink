import { MoreVertical, Zap, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProfileServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number | null;

    image: string;
    category: string;
    tags: string[];
    postedAt: string;
    is_promoted?: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string, promote: boolean) => void;
  canManage?: boolean;
}

export function ProfileServiceCard({ service, onEdit, onDelete, onPromote, canManage = true }: ProfileServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-bizlink-soft transition-all duration-200 bg-card border border-border">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          <div className="w-24 h-20 flex-shrink-0 bg-muted">
            <img 
              src={service.image} 
              alt={service.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {service.title}
                  </h3>
                  {service.is_promoted && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gradient-primary text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Turbinado
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {service.category}
                    </Badge>
                    <span className="text-xs font-medium text-primary">
                      {Number.isFinite(service.price as number) && service.price !== null
                        ? `${(service.price as number).toLocaleString('pt-MZ')} MZN`
                        : 'Sob consulta'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {service.postedAt}
                  </span>
                </div>
              </div>
              
              {/* Menu (only for owner) */}
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-background border border-border shadow-lg">
                    <DropdownMenuItem onClick={() => onEdit(service.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPromote(service.id, !service.is_promoted)}>
                      <Zap className="mr-2 h-4 w-4" />
                      {service.is_promoted ? 'Remover Turbinado' : 'Turbinar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(service.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}