import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({ email: email.trim() });
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`, {
        state: {
          message: 'Si cette adresse email existe dans notre système, un code de réinitialisation vous a été envoyé.',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-blue-100 text-tt-blue mb-2 shadow-soft">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mot de passe oublié ?
          </h2>
          <p className="text-sm text-slate-500">
            Saisissez votre adresse email pour recevoir un code de réinitialisation sécurisé.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-card border-slate-200/80 bg-white">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.com"
              iconLeft={Mail}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Envoyer le code de réinitialisation
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-tt-blue hover:underline"
            >
              ← Retour à la page de connexion
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
