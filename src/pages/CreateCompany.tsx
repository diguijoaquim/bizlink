import { useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X } from "lucide-react";
import { createCompany, apiFetch } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";

export default function CreateCompany() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Company form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [nuit, setNuit] = useState("");
  const [nationality, setNationality] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setCoverFile(file);
        setCoverPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: 'logo' | 'cover') => {
    if (type === 'logo') {
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setCoverFile(null);
      setCoverPreview(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  async function handleCreateCompany() {
    setError(null);
    setSaving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const formData = new FormData();
      
      // Add all fields to form data (matching cURL format)
      formData.append('name', name);
      formData.append('description', description || '');
      formData.append('nuit', nuit || '');
      formData.append('nationality', nationality || '');
      formData.append('province', province || '');
      formData.append('district', district || '');
      formData.append('address', address || '');
      formData.append('website', website || '');
      formData.append('email', companyEmail || '');
      formData.append('whatsapp', whatsapp || '');
      
      // Add logo file if exists
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Add cover file if exists
      if (coverFile) {
        formData.append('cover', coverFile);
      }
      
      // Send all data in a single request
      await apiFetch('/companies/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Authorization header will be added by apiFetch
        },
      });
      
      toast.success('Empresa criada com sucesso!');
      navigate('/profile');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || "Erro ao criar empresa";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Cadastrar nova empresa</h1>
          <p className="text-muted-foreground">Preencha os dados da sua empresa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nome da empresa *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Minha Empresa" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => handleFileChange(e, 'logo')}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
            />
            {logoPreview ? (
              <div className="relative group">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeFile('logo')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => triggerFileInput(logoInputRef)}
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors h-32"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Clique para fazer upload do logo
                  <span className="block text-xs mt-1">PNG, JPG, WebP (máx. 5MB)</span>
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => handleFileChange(e, 'cover')}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
            />
            {coverPreview ? (
              <div className="relative group">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-full h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeFile('cover')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => triggerFileInput(coverInputRef)}
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors h-32"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Clique para fazer upload da imagem de capa
                  <span className="block text-xs mt-1">PNG, JPG, WebP (máx. 5MB)</span>
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>NUIT *</Label>
            <Input 
              value={nuit} 
              onChange={(e) => setNuit(e.target.value)} 
              placeholder="123456789" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Nacionalidade *</Label>
            <Input 
              value={nationality} 
              onChange={(e) => setNationality(e.target.value)} 
              placeholder="Moçambicana" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Província *</Label>
            <Input 
              value={province} 
              onChange={(e) => setProvince(e.target.value)} 
              placeholder="Maputo" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Distrito *</Label>
            <Input 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)} 
              placeholder="Maputo" 
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço *</Label>
            <Input 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Av. ..." 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Website</Label>
            <Input 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)} 
              placeholder="https://..." 
              type="url"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input 
              value={companyEmail} 
              onChange={(e) => setCompanyEmail(e.target.value)} 
              placeholder="empresa@email.com" 
              type="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>WhatsApp *</Label>
            <Input 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              placeholder="+258 ..." 
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição *</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a sua empresa..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              required
            />
          </div>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateCompany} 
            disabled={saving || !name || !nuit || !nationality || !province || !district || !address || !companyEmail || !whatsapp || !description}
            className="bg-gradient-primary text-white border-0"
          >
            {saving ? "A guardar..." : "Criar Empresa"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
