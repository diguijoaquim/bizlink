import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { InfiniteFeed } from "@/components/InfiniteFeed";
import { ProfileSetupCard } from "@/components/ProfileSetupCard";
import { useHome } from "@/contexts/HomeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user, hasCompany, currentCompany } = useHome();
  const navigate = useNavigate();
  const [hideBanner, setHideBanner] = useState(false);
  const dismiss = () => setHideBanner(true); // legacy (no longer used after card adoption)

  const isFreelancer = (user?.user_type === 'freelancer');
  const isCompanyUser = (user?.user_type === 'company');
  const hasDefinedRole = isFreelancer || isCompanyUser;

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

  // Contact checks
  const userContactMissing = isFreelancer && !(user?.whatsapp || (user as any)?.phone);
  const companyContactMissing = isCompanyUser && (
    !hasCompany || !(currentCompany?.whatsapp || currentCompany?.email)
  );

  const shouldAskRole = !hasDefinedRole;

  const shouldShowCard = (
    shouldAskRole ||
    (isFreelancer && (userIncomplete || userContactMissing)) ||
    (isCompanyUser && (!hasCompany || companyIncomplete || companyContactMissing))
  );

  return (
    <AppLayout>
      <div className="space-y-3">
        {shouldShowCard && (
          shouldAskRole ? (
            <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">⚙️</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">Defina seu tipo de conta</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">Escolha se você é Freelancer ou Empresa para personalizar sua experiência.</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <Button onClick={() => navigate('/profile-setup')} className="bg-gradient-primary text-white border-0">Escolher agora</Button>
                </div>
              </CardContent>
            </Card>
          ) : isFreelancer ? (
            <ProfileSetupCard
              mode="freelancer"
              title="Complete seu perfil"
              description={userContactMissing ? "Adicione nome, foto, localização e contacto (WhatsApp/telefone) para aumentar sua visibilidade no BizLink." : "Adicione nome, foto e localização para aumentar sua visibilidade no BizLink."}
              ctaLabel="Configurar perfil"
              onClick={() => navigate('/profile')}
            />
          ) : (
            <ProfileSetupCard
              mode="company"
              title={!hasCompany ? 'Crie sua empresa' : 'Complete os dados da empresa'}
              description={!hasCompany
                ? 'Crie a página da sua empresa para atrair mais clientes.'
                : (companyContactMissing
                    ? 'Adicione nome, logotipo, localização e um contacto (email/WhatsApp) para melhor desempenho no feed.'
                    : 'Adicione nome, logotipo e localização para melhor desempenho no feed.')}
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