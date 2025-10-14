import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { InfiniteFeed } from "@/components/InfiniteFeed";
import { ProfileSetupCard } from "@/components/ProfileSetupCard";
import { useHome } from "@/contexts/HomeContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user, hasCompany, currentCompany } = useHome();
  const navigate = useNavigate();
  const [hideBanner, setHideBanner] = useState(false);
  const dismiss = () => setHideBanner(true); // legacy (no longer used after card adoption)

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

  const shouldShowCard = (
    (isFreelancer && userIncomplete) ||
    (isCompanyUser && (!hasCompany || companyIncomplete))
  );

  return (
    <AppLayout>
      <div className="space-y-3">
        {shouldShowCard && (
          isFreelancer ? (
            <ProfileSetupCard
              mode="freelancer"
              title="Complete seu perfil"
              description="Adicione nome, foto e localização para aumentar sua visibilidade no BizLink."
              ctaLabel="Configurar perfil"
              onClick={() => navigate('/profile')}
            />
          ) : (
            <ProfileSetupCard
              mode="company"
              title={!hasCompany ? 'Crie sua empresa' : 'Complete os dados da empresa'}
              description={!hasCompany ? 'Crie a página da sua empresa para atrair mais clientes.' : 'Adicione nome, logotipo e localização para melhor desempenho no feed.'}
              ctaLabel={!hasCompany ? 'Criar empresa' : 'Completar empresa'}
              onClick={() => navigate(!hasCompany ? '/create-company' : '/edit-company')}
            />
          )
        )}

        <InfiniteFeed showSearchAsLink />
      </div>
    </AppLayout>
  );
}