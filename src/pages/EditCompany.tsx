import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL, apiFetch, updateCompany, updateCompanyCover, updateCompanyLogo } from "@/lib/api";
import { ArrowLeft, Upload } from "lucide-react";

export default function EditCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nuit, setNuit] = useState("");
  const [nationality, setNationality] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch(`/users/me`);
        const firstCompany = me?.companies?.[0];
        if (!firstCompany?.id) {
          setLoading(false);
          setError("Nenhuma empresa encontrada");
          return;
        }
        setCompanyId(firstCompany.id);
        setName(firstCompany.name || "");
        setDescription(firstCompany.description || "");
        setNuit(firstCompany.nuit || "");
        setNationality(firstCompany.nationality || "");
        setProvince(firstCompany.province || "");
        setDistrict(firstCompany.district || "");
        setAddress(firstCompany.address || "");
        setWebsite(firstCompany.website || "");
        setCompanyEmail(firstCompany.email || "");
        setWhatsapp(firstCompany.whatsapp || "");
        setLogoUrl(firstCompany.logo_url ? toAbsolute(firstCompany.logo_url) : undefined);
        setCoverUrl(firstCompany.cover_url ? toAbsolute(firstCompany.cover_url) : undefined);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar dados");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toAbsolute = (url?: string) => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  const onSelectFile = async (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    // basic validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    if (type === 'logo') setLogoPreview(objectUrl);
    if (type === 'cover') setCoverPreview(objectUrl);

    setSaving(true);
    setError(null);
    try {
      if (type === 'logo') {
        const updated = await updateCompanyLogo(companyId, file);
        setLogoUrl(updated.logo_url ? toAbsolute(updated.logo_url) : undefined);
      } else {
        const updated = await updateCompanyCover(companyId, file);
        setCoverUrl(updated.cover_url ? toAbsolute(updated.cover_url) : undefined);
      }
    } catch (e: any) {
      setError(e?.message || 'Falha ao enviar imagem');
    } finally {
      setSaving(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
      // Cleanup preview URL once upload finishes and server URL is set
      if (type === 'logo' && logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      if (type === 'cover' && coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
    }
  };

  const onSave = async () => {
    if (!companyId) return;
    setSaving(true);
    setError(null);
    try {
      const descriptionHtml = editorRef.current?.innerHTML || '';
      await updateCompany(companyId, {
        name,
        description: descriptionHtml,
        nuit,
        nationality,
        province,
        district,
        address,
        website,
        email: companyEmail,
        whatsapp,
      });
      navigate('/profile');
    } catch (e: any) {
      setError(e?.message || 'Falha ao atualizar empresa');
    } finally {
      setSaving(false);
    }
  };

  // Simple rich text editor controls
  const applyFormat = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
  };

  const applyHeading = (level: 1 | 2 | 3) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const tag = `H${level}`;
    document.execCommand('formatBlock', false, tag);
  };

  // Initialize editor content after loading data
  useEffect(() => {
    if (editorRef.current && description) {
      editorRef.current.innerHTML = description;
    }
  }, [description]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Carregando...</div>
      </AppLayout>
    );
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
          <h1 className="text-2xl font-bold">Atualizar empresa</h1>
          <p className="text-muted-foreground">Edite os dados e as imagens</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => onSelectFile(e, 'logo')}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
            />
            {logoPreview ? (
              <div className="relative group">
                <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-md border" />
                <div className="mt-2 flex items-center gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => logoInputRef.current?.click()} disabled={saving}>
                    Trocar logo
                  </Button>
                </div>
              </div>
            ) : logoUrl ? (
              <div className="relative group">
                <img src={logoUrl} alt="Logo" className="w-32 h-32 object-cover rounded-md border" />
                <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => logoInputRef.current?.click()}>
                  Trocar logo
                </Button>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors h-32"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">Clique para enviar o logo</p>
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Imagem de capa</Label>
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => onSelectFile(e, 'cover')}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
            />
            {coverPreview ? (
              <div className="relative group">
                <img src={coverPreview} alt="Capa preview" className="w-full h-40 object-cover rounded-md border" />
                <div className="mt-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={saving}>
                    Trocar capa
                  </Button>
                </div>
              </div>
            ) : coverUrl ? (
              <div className="relative group">
                <img src={coverUrl} alt="Capa" className="w-full h-40 object-cover rounded-md border" />
                <div className="mt-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>
                    Trocar capa
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors h-40"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">Clique para enviar a capa</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>NUIT *</Label>
            <Input value={nuit} onChange={(e) => setNuit(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nacionalidade *</Label>
            <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Província *</Label>
            <Input value={province} onChange={(e) => setProvince(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Distrito *</Label>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço *</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp *</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Descrição (Rich Text)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => applyFormat('bold')}>Negrito</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => applyFormat('insertUnorderedList')}>Lista</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => applyHeading(3)}>Título</Button>
            </div>
            <div className="biz-rich-text rounded-md border border-input bg-background px-3 py-2 text-sm">
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[100px] focus:outline-none"
                onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
              />
            </div>
            <p className="text-xs text-muted-foreground">O texto formatado será salvo como HTML.</p>
          </div>

        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
          <Button onClick={onSave} disabled={saving} className="bg-gradient-primary text-white border-0">
            {saving ? "A guardar..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}


