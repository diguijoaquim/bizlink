import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useHome } from '@/contexts/HomeContext';

export function ProfileSetupPrompt() {
  const { user, hasCompany, currentCompany } = useHome() as any;
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const { shouldShow, isFreelancer, isCompanyUser } = useMemo(() => {
    const isFreelancer = user?.user_type === 'freelancer';
    const isCompanyUser = user?.user_type === 'company';

    const userIncomplete = !!user && (
      !(user.full_name && String(user.full_name).trim()) ||
      !(user.profile_photo_url && String(user.profile_photo_url).trim()) ||
      !(user.province && String(user.province).trim()) ||
      !(user.district && String(user.district).trim())
    );

    const companyIncomplete = isCompanyUser && !!currentCompany && (
      !(currentCompany.name && String(currentCompany.name).trim()) ||
      !(currentCompany.logo_url && String(currentCompany.logo_url).trim()) ||
      !(currentCompany.province && String(currentCompany.province).trim()) ||
      !(currentCompany.district && String(currentCompany.district).trim())
    );

    const shouldShow = (!!user) && (
      (isFreelancer && userIncomplete) ||
      (isCompanyUser && (!hasCompany || companyIncomplete))
    );

    return { shouldShow, isFreelancer, isCompanyUser };
  }, [user, hasCompany, currentCompany]);

  if (!shouldShow || dismissed) return null;

  const goProfile = () => navigate('/profile');
  const goCompany = () => navigate(!hasCompany ? '/create-company' : '/edit-company');

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-4 md:right-auto md:w-80 border-primary bg-card shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Completar perfil</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isFreelancer
                ? 'Adicione nome, foto e localização para aumentar sua visibilidade.'
                : 'Crie/complete os dados da sua empresa para melhor desempenho no feed.'}
            </p>
            <div className="flex gap-2">
              {isFreelancer ? (
                <Button onClick={goProfile} size="sm" className="flex-1">Configurar perfil</Button>
              ) : (
                <Button onClick={goCompany} size="sm" className="flex-1">{!hasCompany ? 'Criar empresa' : 'Completar empresa'}</Button>
              )}
              <Button onClick={() => setDismissed(true)} variant="outline" size="sm">Agora não</Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="ml-2 h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
