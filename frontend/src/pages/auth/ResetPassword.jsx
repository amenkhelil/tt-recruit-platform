import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const hasMinLength = formData.newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.newPassword);
  const hasLower = /[a-z]/.test(formData.newPassword);
  const hasDigit = /\d/.test(formData.newPassword);
  const passwordsMatch = formData.newPassword && formData.newPassword === formData.confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }
    if (!formData.code || formData.code.length !== 6) {
      setError('Veuillez renseigner le code à 6 chiffres.');
      return;
    }
    if (!isPasswordValid) {
      setError('Le nouveau mot de passe ne respecte pas les critères de sécurité requis.');
      return;
    }
    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        email: formData.email.trim(),
        code: formData.code.trim(),
        newPassword: formData.newPassword,
      });

      setSuccess('Votre mot de passe a été réinitialisé avec succès ! Redirection...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Mot de passe mis à jour ! Vous pouvez vous connecter avec vos nouveaux identifiants.' },
        });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Échec de réinitialisation du mot de passe.';
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
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nouveau Mot de Passe
          </h2>
          <p className="text-sm text-slate-500">
            Saisissez le code à 6 chiffres reçu par email et définissez votre nouveau mot de passe.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-card border-slate-200/80 bg-white">
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@domaine.com"
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Code de sécurité (6 chiffres)
              </label>
              <input
                type="text"
                maxLength={6}
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="123456"
                className="block w-full text-center tracking-[0.4em] text-xl font-bold font-mono py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue bg-slate-50/50"
                required
              />
            </div>

            <Input
              label="Nouveau mot de passe"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              iconLeft={Lock}
              required
            />

            {/* Password security meter */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-600 block">Exigences de sécurité :</span>
              <div className="grid grid-cols-2 gap-1 text-slate-500">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300'}`} />
                  Au moins 8 caractères
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasUpper ? 'text-emerald-500' : 'text-slate-300'}`} />
                  1 majuscule (A-Z)
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-600 font-bold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasLower ? 'text-emerald-500' : 'text-slate-300'}`} />
                  1 minuscule (a-z)
                </span>
                <span className={`flex items-center gap-1 ${hasDigit ? 'text-emerald-600 font-bold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasDigit ? 'text-emerald-500' : 'text-slate-300'}`} />
                  1 chiffre (0-9)
                </span>
              </div>
            </div>

            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              iconLeft={Lock}
              required
              error={formData.confirmPassword && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''}
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Mettre à jour le mot de passe
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-bold text-tt-blue hover:underline">
              ← Retour à la connexion
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
