import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Veuillez renseigner votre adresse email et mot de passe.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      // Redirect based on role or intended location
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'jobseeker') {
        navigate('/candidate/applications', { replace: true });
      } else {
        navigate('/recruiter/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Identifiants invalides. Veuillez réessayer.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-soft border border-slate-100 mb-2">
            <img src="/tt-logo.png" alt="Tunisie Telecom" className="h-9 w-auto" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Espace Connexion
          </h2>
          <p className="text-sm text-slate-500">
            Accédez à la plateforme de recrutement officielle de Tunisie Telecom
          </p>
        </div>

        {/* Card Box */}
        <Card className="p-6 sm:p-8 shadow-card border-slate-200/80 bg-white">
          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
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
              placeholder="exemple@domaine.com"
              iconLeft={Mail}
              required
              autoComplete="email"
            />

            <div className="space-y-1">
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                iconLeft={Lock}
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-tt-blue hover:text-tt-blue-dark transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Vous n'avez pas encore de compte candidat ?{' '}
              <Link
                to="/register"
                className="font-bold text-tt-blue hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Connexion sécurisée par chiffrement JWT & TLS</span>
        </div>
      </div>
    </div>
  );
};
