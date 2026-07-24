'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe seu e-mail');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('E-mail de redefinição enviado!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <AppLogo size={48} className="mb-3" />
          <h1 className="text-2xl font-bold text-foreground">FinanceControl</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle financeiro pessoal completo</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">E-mail enviado!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm text-center hover:bg-primary/90 transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-2">Redefinir senha</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-5">
                Lembrou a senha?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
