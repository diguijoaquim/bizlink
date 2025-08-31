import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { Camera, User, Building2, Briefcase, ArrowLeft } from 'lucide-react';
import { changeUserType, updateUserProfile, createFreelancerProfile, createCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useHome } from '@/contexts/HomeContext';

type UserType = 'simple' | 'freelancer' | 'company';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshData } = useHome();
  
  const [userType, setUserType] = useState<UserType>('simple');
  const [loading, setLoading] = useState(false);
  
  // Campos básicos do usuário
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  
  // Campos específicos do freelancer
  const [freelancerTitle, setFreelancerTitle] = useState('');
  const [freelancerDescription, setFreelancerDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [currency, setCurrency] = useState('MT');
  const [remoteWork, setRemoteWork] = useState(true);
  
  // Campos específicos da empresa
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [nuit, setNuit] = useState('');
  const [companyNationality, setCompanyNationality] = useState('');
  const [companyProvince, setCompanyProvince] = useState('');
  const [companyDistrict, setCompanyDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Imagens
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const companyCoverInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Alterar tipo de usuário
      await changeUserType(userType);
      
      // 2. Atualizar perfil básico
      await updateUserProfile({
        full_name: fullName,
        bio,
        phone,
        gender,
        nationality,
        province,
        district
      });
      
      // 3. Criar perfil específico baseado no tipo
      if (userType === 'freelancer') {
        await createFreelancerProfile({
          title: freelancerTitle,
          description: freelancerDescription,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          currency,
          remote_work: remoteWork
        });
      } else if (userType === 'company') {
        await createCompany({
          name: companyName,
          description: companyDescription,
          nuit,
          nationality: companyNationality,
          province: companyProvince,
          district: companyDistrict,
          address,
          website,
          email: companyEmail,
          whatsapp,
          logoFile,
          coverFile
        });
      }
      
      toast({
        title: "Sucesso",
        description: `Perfil configurado com sucesso como ${userType === 'simple' ? 'usuário básico' : userType === 'freelancer' ? 'freelancer' : 'empresa'}!`,
      });
      
      await refreshData();
      navigate('/profile');
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao configurar perfil',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = (type: 'profile' | 'cover' | 'logo' | 'companyCover') => {
    const inputRef = {
      profile: profileInputRef,
      cover: coverInputRef,
      logo: logoInputRef,
      companyCover: companyCoverInputRef
    }[type];
    
    inputRef.current?.click();
  };

  const handleImageChange = (type: 'profile' | 'cover' | 'logo' | 'companyCover', file: File) => {
    switch (type) {
      case 'profile':
        setProfilePhoto(file);
        break;
      case 'cover':
        setCoverPhoto(file);
        break;
      case 'logo':
        setLogoFile(file);
        break;
      case 'companyCover':
        setCoverFile(file);
        break;
    }
  };

  const getRedirectLink = () => {
    switch (userType) {
      case 'simple':
        return '/profile';
      case 'freelancer':
        return '/freelancer-profile';
      case 'company':
        return '/company-profile';
      default:
        return '/profile';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Configurar Perfil
            </h1>
            <p className="text-muted-foreground">
              Complete seu perfil para começar a usar o BizLink
            </p>
          </div>
        </div>

        {/* Tipo de Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tipo de Usuário
            </CardTitle>
            <CardDescription>
              Selecione como você quer usar o BizLink
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={userType} onValueChange={(value: UserType) => setUserType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Usuário Simples
                  </div>
                </SelectItem>
                <SelectItem value="freelancer">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Freelancer
                  </div>
                </SelectItem>
                <SelectItem value="company">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Perfil Básico */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil Básico</CardTitle>
            <CardDescription>
              Informações pessoais básicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imagens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Foto de Perfil</Label>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleImagePick('profile')}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {profilePhoto ? 'Alterar Foto' : 'Selecionar Foto'}
                  </Button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange('profile', file);
                    }}
                  />
                </div>
              </div>
              
              <div>
                <Label>Foto de Capa</Label>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleImagePick('cover')}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {coverPhoto ? 'Alterar Capa' : 'Selecionar Capa'}
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange('cover', file);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 87 123 456"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="nationality">Nacionalidade</Label>
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Ex: Moçambicano"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Província</Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Ex: Maputo"
                />
              </div>
              
              <div>
                <Label htmlFor="district">Distrito</Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ex: KaMavota"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perfil de Freelancer */}
        {userType === 'freelancer' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Perfil de Freelancer
              </CardTitle>
              <CardDescription>
                Informações profissionais para clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="freelancerTitle">Título Profissional</Label>
                <Input
                  id="freelancerTitle"
                  value={freelancerTitle}
                  onChange={(e) => setFreelancerTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>

              <div>
                <Label htmlFor="freelancerDescription">Descrição Profissional</Label>
                <Textarea
                  id="freelancerDescription"
                  value={freelancerDescription}
                  onChange={(e) => setFreelancerDescription(e.target.value)}
                  placeholder="Descreva suas habilidades, experiência e serviços..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taxa por Hora</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="remoteWork"
                    type="checkbox"
                    checked={remoteWork}
                    onChange={(e) => setRemoteWork(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="remoteWork">Trabalho Remoto</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfil de Empresa */}
        {userType === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Perfil da Empresa
              </CardTitle>
              <CardDescription>
                Informações da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Imagens da empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Logo da Empresa</Label>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleImagePick('logo')}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {logoFile ? 'Alterar Logo' : 'Selecionar Logo'}
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange('logo', file);
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Foto de Capa da Empresa</Label>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleImagePick('companyCover')}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {coverFile ? 'Alterar Capa' : 'Selecionar Capa'}
                    </Button>
                    <input
                      ref={companyCoverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange('companyCover', file);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nuit">NUIT</Label>
                  <Input
                    id="nuit"
                    value={nuit}
                    onChange={(e) => setNuit(e.target.value)}
                    placeholder="Número de identificação fiscal"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyDescription">Descrição da Empresa</Label>
                <Textarea
                  id="companyDescription"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Descreva os serviços e atividades da sua empresa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyNationality">País</Label>
                  <Input
                    id="companyNationality"
                    value={companyNationality}
                    onChange={(e) => setCompanyNationality(e.target.value)}
                    placeholder="Ex: Moçambique"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyProvince">Província</Label>
                  <Input
                    id="companyProvince"
                    value={companyProvince}
                    onChange={(e) => setCompanyProvince(e.target.value)}
                    placeholder="Ex: Maputo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyDistrict">Distrito</Label>
                  <Input
                    id="companyDistrict"
                    value={companyDistrict}
                    onChange={(e) => setCompanyDistrict(e.target.value)}
                    placeholder="Ex: KaMavota"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.suaempresa.mz"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyEmail">Email da Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contato@suaempresa.mz"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+258 87 123 456"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-primary text-white border-0"
          >
            {loading ? 'Configurando...' : 'Configurar Perfil'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(getRedirectLink())}
            className="flex-1"
          >
            Ver Perfil
          </Button>
        </div>

        {/* Informações sobre o tipo selecionado */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {userType === 'simple' && '👤'}
                {userType === 'freelancer' && '💼'}
                {userType === 'company' && '🏢'}
              </div>
              <h3 className="font-semibold mb-2">
                {userType === 'simple' && 'Usuário Simples'}
                {userType === 'freelancer' && 'Freelancer'}
                {userType === 'company' && 'Empresa'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {userType === 'simple' && 'Navegue, busque serviços e conecte-se com empresas e freelancers.'}
                {userType === 'freelancer' && 'Ofereça seus serviços, defina tarifas e receba propostas de trabalho.'}
                {userType === 'company' && 'Cadastre sua empresa, publique serviços e contrate freelancers.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
