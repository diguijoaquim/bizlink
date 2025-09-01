import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { User, Building2, Briefcase, ArrowLeft } from 'lucide-react';
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
  const [phoneLocal, setPhoneLocal] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
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
  const [whatsCode, setWhatsCode] = useState('');
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [openNationality, setOpenNationality] = useState(false);
  const [openCompanyNationality, setOpenCompanyNationality] = useState(false);
  const [openPhoneCode, setOpenPhoneCode] = useState(false);
  const [openWhatsCode, setOpenWhatsCode] = useState(false);
  const [callingCodes, setCallingCodes] = useState<{ name: string; code: string; dial: string }[]>([]);
  const [openProvince, setOpenProvince] = useState(false);
  const [openCompanyProvince, setOpenCompanyProvince] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openCompanyDistrict, setOpenCompanyDistrict] = useState(false);

  // Minimal ISO-3166-2-like provinces dataset (extend as needed)
  const getProvincesByCountryName = (countryName?: string): string[] => {
    if (!countryName) return [];
    const normalized = countryName.toLowerCase();
    if (normalized.includes('moçambique') || normalized.includes('mozambique')) {
      return [
        'Cabo Delgado',
        'Gaza',
        'Inhambane',
        'Manica',
        'Maputo',
        'Maputo Cidade',
        'Nampula',
        'Niassa',
        'Sofala',
        'Tete',
        'Zambézia',
      ];
    }
    // Add more countries here if desired
    return [];
  };

  const getDistrictsByCountryProvince = (countryName?: string, provinceName?: string): string[] => {
    if (!countryName || !provinceName) return [];
    const isMoz = (countryName.toLowerCase().includes('moçambique') || countryName.toLowerCase().includes('mozambique'));
    if (!isMoz) return [];
    const p = provinceName.toLowerCase();
    const map: Record<string, string[]> = {
      'cabo delgado': [
        'Ancuabe','Balama','Chiúre','Ibo','Macomia','Mecúfi','Meluco','Metuge','Mocímboa da Praia','Montepuez','Mueda','Muidumbe','Namuno','Nangade','Palma','Pemba'
      ],
      'gaza': [
        'Bilene','Chibuto','Chicualacuala','Chigubo','Chókwè','Chongoene','Guijá','Limpopo','Mabalane','Manjacaze','Massangena','Massingir','Xai-Xai'
      ],
      'inhambane': [
        'Funhalouro','Govuro','Homoíne','Inhambane','Inharrime','Inhassoro','Jangamo','Mabote','Massinga','Morrumbene','Panda','Vilankulo','Zavala'
      ],
      'manica': [
        'Báruè','Chimoio','Gondola','Guro','Macate','Machaze','Macossa','Manica','Mossurize','Sussundenga','Tambara','Vandúzi'
      ],
      'maputo': [
        'Boane','Magude','Manhiça','Marracuene','Matutuíne','Moamba','Namaacha','Matola'
      ],
      'maputo cidade': [
        'KaMpfumo','KaMaxaquene','KaMavota','KaMubukwana','KaTembe','KaNyaka'
      ],
      'nampula': [
        'Angoche','Eráti','Ilha de Moçambique','Lalaua','Larde','Malema','Meconta','Mecubúri','Mogincual','Mogovolas','Moma','Monapo','Mossuril','Muecate','Murrupula','Nacarôa','Nacala-a-Velha','Nacala Porto','Nampula','Rapale','Ribáuè'
      ],
      'niassa': [
        'Cuamba','Lago','Lichinga','Majune','Mandimba','Marrupa','Maúa','Mavago','Mecanhelas','Mecula','Metarica','Muembe','Ngauma','Sanga'
      ],
      'sofala': [
        'Beira','Búzi','Caia','Chemba','Cheringoma','Chibabava','Dondo','Gorongosa','Machanga','Marínguè','Marromeu','Muanza','Nhamatanda'
      ],
      'tete': [
        'Angónia','Cahora-Bassa','Changara','Chifunde','Chiuta','Doa','Macanga','Mágoè','Marávia','Moatize','Mutarara','Tsangano','Zumbo','Tete'
      ],
      'zambézia': [
        'Alto Molócuè','Chinde','Derre','Gilé','Gurué','Ile','Inhassunge','Lugela','Maganja da Costa','Milange','Mocuba','Mocubela','Molumbo','Mopeia','Morrumbala','Mulevala','Namacurra','Namarroi','Nicoadala','Pebane','Quelimane'
      ],
    };
    return map[p] || [];
  };
  
  // Imagens removidas desta tela

  // Load countries and calling codes for nationality/phone selects
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        setCountriesError(null);
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,translations,idd');
        if (!res.ok) throw new Error('Falha ao carregar países');
        const data = await res.json();
        const mapped = (data || [])
          .map((c: any) => ({
            name: (c?.translations?.por?.common as string) || (c?.name?.common as string),
            code: c?.cca2 as string,
          }))
          .filter((c: any) => !!c.name)
          .sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt'));
        setCountries(mapped);
        const codes = (data || [])
          .map((c: any) => {
            const name = (c?.translations?.por?.common as string) || (c?.name?.common as string);
            const code = c?.cca2 as string;
            const root = c?.idd?.root as string | undefined;
            const suffixes = (c?.idd?.suffixes as string[] | undefined) || [];
            const dial = root && suffixes.length > 0 ? `${root}${suffixes[0]}` : root || '';
            return name && code && dial ? { name, code, dial } : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt')) as { name: string; code: string; dial: string }[];
        setCallingCodes(codes);
        // Defaults to Moçambique if available
        const mz = mapped.find((c: any) => c.name.toLowerCase().includes('moçambique') || c.code === 'MZ' || c.name.toLowerCase().includes('mozambique'));
        if (!nationality && mz) setNationality(mz.name);
        if (!companyNationality && mz) setCompanyNationality(mz.name);
        const mzCode = codes.find((c) => c.code === 'MZ' || c.name.toLowerCase().includes('moçambique'));
        if (!phoneCode && mzCode?.dial) setPhoneCode(mzCode.dial);
        if (!whatsCode && mzCode?.dial) setWhatsCode(mzCode.dial);
      } catch (e: any) {
        setCountriesError(e?.message || 'Não foi possível carregar países');
        setCountries([]);
      } finally {
        setCountriesLoading(false);
      }
    };
    loadCountries();
  }, []);

  // Reset province when country changes and selected province is not valid
  useEffect(() => {
    const list = getProvincesByCountryName(nationality);
    if (list.length > 0 && province && !list.includes(province)) {
      setProvince('');
    }
    // Close related popovers when country changes
    setOpenNationality(false);
    setOpenProvince(false);
    setOpenDistrict(false);
  }, [nationality]);

  useEffect(() => {
    const list = getProvincesByCountryName(companyNationality);
    if (list.length > 0 && companyProvince && !list.includes(companyProvince)) {
      setCompanyProvince('');
    }
    // Close related popovers when country changes
    setOpenCompanyNationality(false);
    setOpenCompanyProvince(false);
    setOpenCompanyDistrict(false);
  }, [companyNationality]);

  useEffect(() => {
    const districts = getDistrictsByCountryProvince(nationality, province);
    if (district && districts.length > 0 && !districts.includes(district)) {
      setDistrict('');
    }
  }, [nationality, province]);

  useEffect(() => {
    const districts = getDistrictsByCountryProvince(companyNationality, companyProvince);
    if (companyDistrict && districts.length > 0 && !districts.includes(companyDistrict)) {
      setCompanyDistrict('');
    }
  }, [companyNationality, companyProvince]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Alterar tipo de usuário
      await changeUserType(userType);
      
      // 2. Atualizar perfil básico
      await updateUserProfile({
        full_name: fullName,
        bio,
        phone: phoneCode && phoneLocal ? `${phoneCode} ${phoneLocal}` : phoneLocal,
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
          whatsapp: whatsCode && whatsapp ? `${whatsCode} ${whatsapp}` : whatsapp
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
            {/* Campos de imagem removidos desta tela */}

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
                <div className="mt-2 flex gap-2">
                  <div className="w-36">
                    <Popover open={openPhoneCode} onOpenChange={setOpenPhoneCode}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openPhoneCode} className="w-full justify-between">
                          {phoneCode || (countriesLoading ? '...' : '+Código')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput placeholder="Pesquisar país..." />
                          <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {callingCodes.map((c) => (
                                <CommandItem
                                  key={c.code}
                                  value={`${c.name} ${c.dial}`}
                                  onSelect={() => {
                                    setPhoneCode(c.dial);
                                    setOpenPhoneCode(false);
                                  }}
                                >
                                  {c.name} ({c.code}) {c.dial}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                <Input
                  id="phone"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder="87 123 456"
                  />
                </div>
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
                {countries.length > 0 ? (
                  <div key={`nat-${nationality || 'none'}`}>
                  <Popover open={openNationality} onOpenChange={setOpenNationality}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openNationality} className="w-full justify-between">
                        {nationality || (countriesLoading ? 'Carregando países...' : 'Selecione o país')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Pesquisar país..." />
                        <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {countries.map((c) => (
                              <CommandItem
                                key={c.code}
                                value={c.name}
                                onSelect={(value) => {
                                  setNationality(value);
                                  setOpenNationality(false);
                                }}
                              >
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  </div>
                ) : (
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                    placeholder={countriesLoading ? 'Carregando países...' : 'Ex: Moçambique'}
                />
                )}
                {countriesError && (
                  <p className="mt-1 text-xs text-red-500">{countriesError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Província</Label>
                {getProvincesByCountryName(nationality).length > 0 ? (
                  <div key={`prov-${nationality}-${province || 'none'}`}>
                  <Popover open={openProvince} onOpenChange={setOpenProvince}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openProvince} className="w-full justify-between">
                        {province || 'Selecione a província'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Pesquisar província..." />
                        <CommandEmpty>Nenhuma província encontrada.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {getProvincesByCountryName(nationality).map((p) => (
                              <CommandItem
                                key={p}
                                value={p}
                                onSelect={(value) => {
                                  setProvince(value);
                                  setOpenProvince(false);
                                }}
                              >
                                {p}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  </div>
                ) : (
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Ex: Maputo"
                />
                )}
              </div>
              
              <div>
                <Label htmlFor="district">Distrito</Label>
                {getDistrictsByCountryProvince(nationality, province).length > 0 ? (
                  <div key={`dist-${nationality}-${province}-${district || 'none'}`}>
                  <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openDistrict} className="w-full justify-between">
                        {district || 'Selecione o distrito'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Pesquisar distrito..." />
                        <CommandEmpty>Nenhum distrito encontrado.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {getDistrictsByCountryProvince(nationality, province).map((d) => (
                              <CommandItem
                                key={d}
                                value={d}
                                onSelect={(value) => {
                                  setDistrict(value);
                                  setOpenDistrict(false);
                                }}
                              >
                                {d}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  </div>
                ) : (
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ex: KaMavota"
                />
                )}
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
              {/* Campos de imagem da empresa removidos desta tela */}

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
                  {countries.length > 0 ? (
                    <div key={`comp-nat-${companyNationality || 'none'}`}>
                    <Popover open={openCompanyNationality} onOpenChange={setOpenCompanyNationality}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCompanyNationality} className="w-full justify-between">
                          {companyNationality || (countriesLoading ? 'Carregando países...' : 'Selecione o país')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput placeholder="Pesquisar país..." />
                          <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {countries.map((c) => (
                                <CommandItem
                                  key={c.code}
                                  value={c.name}
                                  onSelect={(value) => {
                                    setCompanyNationality(value);
                                    setOpenCompanyNationality(false);
                                  }}
                                >
                                  {c.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    </div>
                  ) : (
                  <Input
                    id="companyNationality"
                    value={companyNationality}
                    onChange={(e) => setCompanyNationality(e.target.value)}
                      placeholder={countriesLoading ? 'Carregando países...' : 'Ex: Moçambique'}
                  />
                  )}
                  {countriesError && (
                    <p className="mt-1 text-xs text-red-500">{countriesError}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="companyProvince">Província</Label>
                  {getProvincesByCountryName(companyNationality).length > 0 ? (
                    <div key={`comp-prov-${companyNationality}-${companyProvince || 'none'}`}>
                    <Popover open={openCompanyProvince} onOpenChange={setOpenCompanyProvince}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCompanyProvince} className="w-full justify-between">
                          {companyProvince || 'Selecione a província'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput placeholder="Pesquisar província..." />
                          <CommandEmpty>Nenhuma província encontrada.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {getProvincesByCountryName(companyNationality).map((p) => (
                                <CommandItem
                                  key={p}
                                  value={p}
                                  onSelect={(value) => {
                                    setCompanyProvince(value);
                                    setOpenCompanyProvince(false);
                                  }}
                                >
                                  {p}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    </div>
                  ) : (
                  <Input
                    id="companyProvince"
                    value={companyProvince}
                    onChange={(e) => setCompanyProvince(e.target.value)}
                    placeholder="Ex: Maputo"
                  />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyDistrict">Distrito</Label>
                  {getDistrictsByCountryProvince(companyNationality, companyProvince).length > 0 ? (
                    <div key={`comp-dist-${companyNationality}-${companyProvince}-${companyDistrict || 'none'}`}>
                    <Popover open={openCompanyDistrict} onOpenChange={setOpenCompanyDistrict}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCompanyDistrict} className="w-full justify-between">
                          {companyDistrict || 'Selecione o distrito'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput placeholder="Pesquisar distrito..." />
                          <CommandEmpty>Nenhum distrito encontrado.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {getDistrictsByCountryProvince(companyNationality, companyProvince).map((d) => (
                                <CommandItem
                                  key={d}
                                  value={d}
                                  onSelect={(value) => {
                                    setCompanyDistrict(value);
                                    setOpenCompanyDistrict(false);
                                  }}
                                >
                                  {d}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    </div>
                  ) : (
                  <Input
                    id="companyDistrict"
                    value={companyDistrict}
                    onChange={(e) => setCompanyDistrict(e.target.value)}
                    placeholder="Ex: KaMavota"
                  />
                  )}
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
                <div className="mt-2 flex gap-2">
                  <div className="w-36">
                    <Popover open={openWhatsCode} onOpenChange={setOpenWhatsCode}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openWhatsCode} className="w-full justify-between">
                          {whatsCode || (countriesLoading ? '...' : '+Código')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput placeholder="Pesquisar país..." />
                          <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {callingCodes.map((c) => (
                                <CommandItem
                                  key={c.code}
                                  value={`${c.name} ${c.dial}`}
                                  onSelect={() => {
                                    setWhatsCode(c.dial);
                                    setOpenWhatsCode(false);
                                  }}
                                >
                                  {c.name} ({c.code}) {c.dial}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="87 123 456"
                />
                </div>
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
