import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  // Password validation checks based on backend Joi rules
  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasDigit = /\d/.test(formData.password);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Veuillez saisir votre nom et prénom.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité exigés.');
      return;
    }

    if (!passwordsMatch) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });

      // Redirect to email verification page with userId and email
      navigate(`/verify-email?userId=${data.userId}&email=${encodeURIComponent(data.email)}`, {
        state: {
          message: 'Votre compte candidat a été créé avec succès ! Un code de vérification à 6 chiffres vous a été envoyé par email.',
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'Une erreur est survenue lors de la création du compte.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-soft border border-slate-100 mb-2">
            <img src="/tt-logo.png" alt="Tunisie Telecom" className="h-9 w-auto" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Créer un compte Candidat
          </h2>
          <p className="text-sm text-slate-500">
            Rejoignez les talents de Tunisie Telecom
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 shadow-card border-slate-200/80 bg-white">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom et Prénom"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="ex. Mohamed Ben Ali"
              iconLeft={User}
              required
            />

            <Input
              label="Adresse Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@domaine.tn"
              iconLeft={Mail}
              required
              autoComplete="email"
            />

            <Input
              label="Numéro de Téléphone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+216 20 000 000"
              iconLeft={Phone}
              helperText="Optionnel — pour le contact direct par les RH de Tunisie Telecom"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              iconLeft={Lock}
              required
              autoComplete="new-password"
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
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              iconLeft={Lock}
              required
              error={formData.confirmPassword && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full mt-3"
              size="lg"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Créer mon compte Candidat
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-tt-blue hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>

        {/* Note */}
        <div className="text-center text-xs text-slate-400">
          En créant un compte, vous acceptez le traitement de vos données pour les recrutements chez Tunisie Telecom.
        </div>
      </div>
    </div>
  );
};
