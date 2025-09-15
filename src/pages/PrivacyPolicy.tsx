import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>
      <p className="mb-4">
        A sua privacidade é importante para nós. Esta Política de Privacidade descreve
        como coletamos, usamos e protegemos as suas informações quando utiliza a plataforma BizLink.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Informações que coletamos</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Dados de conta: nome, e‑mail, senha (hash), tipo de usuário.</li>
        <li>Dados de perfil: foto, bio, localização, habilidades e portfólios.</li>
        <li>Dados de uso: páginas visitadas, interações e métricas de acesso.</li>
        <li>Dados de comunicação: mensagens, notificações e preferências.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Como usamos os dados</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Operar e melhorar a plataforma.</li>
        <li>Personalizar a experiência e recomendações.</li>
        <li>Garantir segurança, detecção de fraudes e cumprimento legal.</li>
        <li>Comunicar novidades e atualizações, quando autorizado.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Compartilhamento</h2>
      <p className="mb-4">
        Não vendemos os seus dados. Podemos compartilhar informações com provedores de serviço
        (por exemplo, hospedagem e e‑mail) que operam em nosso nome sob contratos de confidencialidade,
        ou quando exigido por lei.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Segurança</h2>
      <p className="mb-4">
        Adotamos medidas técnicas e organizacionais para proteger os seus dados. Nenhum método de
        transmissão ou armazenamento é 100% seguro, mas trabalhamos continuamente para reduzir riscos.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Seus direitos</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Acessar, corrigir ou excluir seus dados conforme a lei aplicável.</li>
        <li>Revogar consentimentos e gerenciar preferências de comunicação.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Retenção</h2>
      <p className="mb-4">
        Mantemos os dados pelo tempo necessário para cumprir as finalidades desta política ou
        conforme exigido por lei.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Contato</h2>
      <p className="mb-4">
        Em caso de dúvidas, entre em contato pelo e‑mail: suporte@bizlinkmz.com.
      </p>

      <p className="text-xs text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
