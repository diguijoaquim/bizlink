import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCog, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileSetupCard({
  mode,
  title,
  description,
  ctaLabel,
  onClick,
}: {
  mode: 'freelancer' | 'company';
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  const Icon = mode === 'freelancer' ? UserCog : Building2;

  return (
    <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${mode==='company' ? 'avatar-company' : 'avatar-freelancer'} bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <Badge variant="secondary" className="text-[10px]">{mode==='company'?'Empresa':'Perfil'}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Recomendado</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-foreground mb-3 leading-relaxed">
            {description}
          </p>
          <Button onClick={onClick} className="bg-gradient-primary text-white border-0">
            {ctaLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
