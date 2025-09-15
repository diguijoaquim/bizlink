import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 text-sm leading-6">
      <h1 className="text-2xl font-bold mb-4">Termos de Serviço</h1>
      <p className="mb-4">
        Ao utilizar a plataforma BizLink, você concorda com estes Termos de Serviço. Leia-os atentamente.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Conta e acesso</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Você é responsável por manter a confidencialidade das suas credenciais.</li>
        <li>Atividades realizadas na sua conta são de sua responsabilidade.</li>
        <li>Podemos suspender contas em caso de violação destes termos ou suspeita de fraude.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Conteúdo</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Você mantém os direitos sobre o conteúdo que publicar.</li>
        <li>Não publique conteúdo ilegal, ofensivo, enganoso ou que viole direitos de terceiros.</li>
        <li>Podemos remover conteúdo que viole estes termos.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Uso aceitável</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Não tente explorar vulnerabilidades, burlar segurança ou sobrecarregar nossos sistemas.</li>
        <li>Respeite outros usuários e as leis aplicáveis.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Serviços pagos</h2>
      <p className="mb-4">
        Alguns recursos podem ser pagos. Os valores, formas de pagamento e políticas de reembolso
        serão indicados quando aplicável.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Isenções e limitações</h2>
      <p className="mb-4">
        A plataforma é fornecida "no estado em que se encontra". Não garantimos disponibilidade
        ininterrupta ou ausência de erros. Em nenhuma hipótese seremos responsáveis por danos
        indiretos, incidentais ou consequenciais.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Alterações</h2>
      <p className="mb-4">
        Podemos atualizar estes Termos periodicamente. O uso contínuo da plataforma após mudanças
        constitui aceitação dos novos termos.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Contato</h2>
      <p className="mb-4">Dúvidas? Entre em contato: suporte@bizlinkmz.com.</p>

      <p className="text-xs text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default TermsOfService;
