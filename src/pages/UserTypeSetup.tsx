import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { User, Building2, Briefcase } from 'lucide-react';
import { changeUserType } from '@/lib/api';
import { toast } from 'sonner';

export default function UserTypeSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleTypeSelection = async (type: 'simple' | 'freelancer' | 'company') => {
    setLoading(true);
    try {
      await changeUserType(type);
      
      toast.success(`Tipo de usuário alterado para ${
        type === 'simple' ? 'usuário básico' : 
        type === 'freelancer' ? 'freelancer' : 'empresa'
      }!`);

      // Redirecionar baseado no tipo
      if (type === 'company') {
        navigate('/create-company');
      } else if (type === 'freelancer') {
        navigate('/freelancer-profile');
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar tipo de usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Como você quer usar o BizLink?
          </h1>
          <p className="text-muted-foreground">
            Escolha o tipo de conta que melhor se adequa ao seu perfil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Usuário Simples */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Usuário Básico</CardTitle>
              <CardDescription>
                Para navegar, buscar serviços e conectar-se com empresas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• Buscar serviços e empresas</li>
                <li>• Conectar-se com profissionais</li>
                <li>• Visualizar portfólios</li>
                <li>• Perfil básico</li>
              </ul>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleTypeSelection('simple')}
                disabled={loading}
              >
                Continuar como Usuário Básico
              </Button>
            </CardContent>
          </Card>

          {/* Freelancer */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Freelancer</CardTitle>
              <CardDescription>
                Para oferecer seus serviços como profissional autônomo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• Criar perfil profissional</li>
                <li>• Definir tarifas por hora</li>
                <li>• Mostrar portfólio</li>
                <li>• Receber propostas de trabalho</li>
              </ul>
              <Button 
                className="w-full bg-gradient-primary text-white"
                onClick={() => handleTypeSelection('freelancer')}
                disabled={loading}
              >
                Tornar-me Freelancer
              </Button>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Empresa</CardTitle>
              <CardDescription>
                Para cadastrar sua empresa e oferecer serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• Cadastrar empresa completa</li>
                <li>• Publicar serviços</li>
                <li>• Contratar freelancers</li>
                <li>• Postar vagas de emprego</li>
              </ul>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleTypeSelection('company')}
                disabled={loading}
              >
                Cadastrar Empresa
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Não se preocupe, você pode alterar seu tipo de conta a qualquer momento nas configurações.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
