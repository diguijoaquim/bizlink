import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import bizlinkLogo from "@/assets/bizlink-logo.png";
import { registerUser, loginWithPassword, saveAuthToken } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ email, full_name: fullName || undefined, password });
      const res = await loginWithPassword(email, password);
      saveAuthToken(res.access_token);
      navigate("/profile");
    } catch (err: any) {
      setError(err?.message || "Falha ao registar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-bizlink-soft mb-4">
            <img src={bizlinkLogo} alt="BizLink" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Criar conta</h1>
          <p className="text-muted-foreground">Junte-se ao BizLink</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-bizlink-soft">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="full_name" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button disabled={loading} className="w-full bg-gradient-primary text-white border-0 hover:opacity-90 h-11">
              {loading ? "A criar conta..." : "Registar"}
            </Button>
          </form>

          <div className="my-6">
            <Separator className="my-4" />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta? <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

