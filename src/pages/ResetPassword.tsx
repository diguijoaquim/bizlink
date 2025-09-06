import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, completePasswordReset } from '@/lib/api';

export default function ResetPassword() {
  const [step, setStep] = useState<'request'|'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await requestPasswordReset(email);
      setMessage('Código enviado para o seu email. Verifique sua caixa de entrada.');
      setStep('verify');
    } catch (e: any) {
      setMessage(e?.message || 'Falha ao enviar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email || !otp || !password) return;
    try {
      setLoading(true);
      await completePasswordReset({ email, otp, newPassword: password });
      setMessage('Senha alterada com sucesso. Redirecionando...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e: any) {
      setMessage(e?.message || 'Falha ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto bg-card border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        {message && <div className="text-sm text-muted-foreground">{message}</div>}
        {step === 'request' ? (
          <div className="space-y-3">
            <label className="text-sm">Email</label>
            <Input placeholder="seu@email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Button onClick={handleRequest} disabled={loading} className="w-full">{loading ? 'Enviando...' : 'Enviar código'}</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm">Código (OTP)</label>
            <Input placeholder="123456" value={otp} onChange={(e)=>setOtp(e.target.value)} />
            <label className="text-sm">Nova senha</label>
            <Input type="password" placeholder="Nova senha" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button onClick={handleReset} disabled={loading} className="w-full">{loading ? 'Redefinindo...' : 'Redefinir senha'}</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
