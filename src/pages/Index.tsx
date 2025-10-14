import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { InfiniteFeed } from "@/components/InfiniteFeed";
import { useHome } from "@/contexts/HomeContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user, hasCompany, currentCompany } = useHome();
  const navigate = useNavigate();
  const [hideBanner, setHideBanner] = useState(false);
  const dismiss = () => setHideBanner(true); // hides only until next mount/visit

  const isFreelancer = (user?.user_type === 'freelancer');
  const isCompanyUser = (user?.user_type === 'company');

  const userIncomplete = !!user && (
    !(user.full_name && user.full_name.trim()) ||
    !(user.profile_photo_url && user.profile_photo_url.trim()) ||
    !(user.province && user.province.trim()) ||
    !(user.district && user.district.trim())
  );
  const companyIncomplete = isCompanyUser && !!currentCompany && (
    !(currentCompany.name && currentCompany.name.trim()) ||
    !(currentCompany.logo_url && currentCompany.logo_url.trim()) ||
    !(currentCompany.province && currentCompany.province.trim()) ||
    !(currentCompany.district && currentCompany.district.trim())
  );

  const shouldShowBanner = !hideBanner && (
    (isFreelancer && userIncomplete) ||
    (isCompanyUser && (!hasCompany || companyIncomplete))
  );

  return (
    <AppLayout>
      <div className="space-y-3">
        {shouldShowBanner && (
          <div className="mx-auto w-full max-w-2xl p-3 rounded-lg border bg-card text-foreground">
            {isFreelancer ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold">Melhore sua visibilidade no BizLink</div>
                  <div className="text-sm text-muted-foreground">Complete seu perfil (nome, foto e localização) para aumentar suas chances de aparecer para clientes.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/profile')}>Completar perfil</Button>
                  <Button variant="ghost" onClick={dismiss}>Fechar</Button>
                </div>
              </div>
            ) : isCompanyUser ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold">Aumente a visibilidade da sua empresa</div>
                  <div className="text-sm text-muted-foreground">{!hasCompany ? 'Crie sua empresa' : 'Complete os dados da empresa (nome, logotipo e localização)'} para ter melhor desempenho no feed.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate(!hasCompany ? '/create-company' : '/edit-company')}>{!hasCompany ? 'Criar empresa' : 'Completar empresa'}</Button>
                  <Button variant="ghost" onClick={dismiss}>Fechar</Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <InfiniteFeed showSearchAsLink />
      </div>
    </AppLayout>
  );
}