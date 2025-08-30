import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { getService, updateService, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Tecnologia",
  "Alimentação",
  "Saúde",
  "Educação",
  "Beleza",
  "Construção",
  "Transporte",
  "Limpeza",
  "Eventos",
  "Consultoria",
  "Marketing",
  "Outros"
];

const statusOptions = [
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
  { value: "Pausado", label: "Pausado" }
];

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [isPromoted, setIsPromoted] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;
      
      try {
        const service = await getService(parseInt(id));
        setTitle(service.title);
        setDescription(service.description);
        setPrice(service.price);
        setCategory(service.category);
        setStatus(service.status);
        setIsPromoted(!!service.is_promoted);
        
        // Parse tags
        if (service.tags) {
          const parsedTags = typeof service.tags === 'string' 
            ? service.tags.replace(/[{}]/g, '').split(',').map(tag => tag.trim()).filter(Boolean)
            : service.tags;
          setTags(parsedTags);
        }
        
        if (service.image_url) {
          setCurrentImageUrl(service.image_url.startsWith('http') 
            ? service.image_url 
            : `${API_BASE_URL}${service.image_url}`);
        }
      } catch (error) {
        console.error('Error loading service:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar serviço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmitting(true);
    
    try {
      await updateService(parseInt(id), {
        title,
        description,
        price,
        category,
        status,
        is_promoted: isPromoted,
        tags,
        image,
      });
      
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!",
      });
      
      navigate("/my-services");
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar serviço",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-services")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Editar Serviço</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Serviço *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvimento de Website"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu serviço em detalhes..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 1500 MT"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoted">Serviço Promovido</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="promoted"
                      checked={isPromoted}
                      onCheckedChange={setIsPromoted}
                    />
                    <Label htmlFor="promoted" className="text-sm text-muted-foreground">
                      Destacar este serviço
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(currentImageUrl || previewUrl) && (
                <div className="relative">
                  <img
                    src={previewUrl || currentImageUrl || ''}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {previewUrl ? "Nova Imagem" : "Imagem Atual"}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para {currentImageUrl ? 'alterar' : 'adicionar'} imagem
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/my-services")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Atualizando..." : "Atualizar Serviço"}
            </Button>
          </div>
        </form>

        {/* Bottom spacing */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}