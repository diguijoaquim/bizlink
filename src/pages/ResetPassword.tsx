import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, completePasswordReset, verifyPasswordResetOtp, resetPasswordWithToken } from '@/lib/api';

export default function ResetPassword() {
  const [step, setStep] = useState<'request'|'verify'|'newpass'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
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

  const handleVerify = async () => {
    if (!email || !otp) return;
    try {
      setLoading(true);
      const res = await verifyPasswordResetOtp({ email, otp });
      setToken(res.token);
      setMessage('Código verificado. Defina a nova senha.');
      setStep('newpass');
    } catch (e: any) {
      setMessage(e?.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token || !password) return;
    try {
      setLoading(true);
      await resetPasswordWithToken({ token, newPassword: password });
      setMessage('Senha alterada com sucesso. Redirecionando...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e: any) {
      setMessage(e?.message || 'Falha ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md bg-card border rounded-xl p-6 space-y-4">
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          {message && <div className="text-sm text-muted-foreground">{message}</div>}
          {step === 'request' && (
            <div className="space-y-3">
              <label className="text-sm">Email</label>
              <Input placeholder="seu@email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <Button onClick={handleRequest} disabled={loading} className="w-full">{loading ? 'Enviando...' : 'Enviar código'}</Button>
            </div>
          )}
          {step === 'verify' && (
            <div className="space-y-3">
              <label className="text-sm">Código (OTP)</label>
              <Input placeholder="123456" value={otp} onChange={(e)=>setOtp(e.target.value)} />
              <Button onClick={handleVerify} disabled={loading} className="w-full">{loading ? 'Verificando...' : 'Verificar código'}</Button>
            </div>
          )}
          {step === 'newpass' && (
            <div className="space-y-3">
              <label className="text-sm">Nova senha</label>
              <Input type="password" placeholder="Nova senha" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <Button onClick={handleReset} disabled={loading} className="w-full">{loading ? 'Redefinindo...' : 'Redefinir senha'}</Button>
            </div>
          )}
        </div>
      </div>
  );
}
