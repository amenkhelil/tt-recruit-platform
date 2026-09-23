import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MailCheck, KeyRound, AlertCircle, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendOtp } = useAuth();

  const userId = searchParams.get('userId') || '';
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Identifiant utilisateur manquant. Veuillez reprendre l\'inscription.');
      return;
    }
    if (!code || code.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres reçu par email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyEmail(userId, code);
      setSuccess('Votre adresse email a été vérifiée avec succès ! Redirection en cours vers la page de connexion...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Votre adresse email est vérifiée. Vous pouvez maintenant vous connecter.' },
        });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Code invalide ou expiré.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId || resendTimer > 0) return;

    setIsResending(true);
    setError('');
    try {
      await resendOtp(userId);
      setSuccess('Un nouveau code de vérification vous a été envoyé par email.');
      setResendTimer(60);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Échec du renvoi du code.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-blue-100 text-tt-blue mb-2 shadow-soft">
            <MailCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vérification de l'Email
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Nous avons envoyé un code de sécurité à 6 chiffres à{' '}
            <span className="font-semibold text-slate-800">{email || 'votre adresse email'}</span>.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 text-center block">
                Code de vérification (6 chiffres)
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="block w-full text-center tracking-[0.5em] text-2xl font-bold font-mono py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue bg-slate-50/50"
                required
                autoFocus
              />
              <p className="text-[11px] text-slate-400 text-center">
                Le code est valable pendant 10 minutes.
              </p>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              iconRight={ArrowRight}
            >
              Vérifier et continuer
            </Button>
          </form>

          {/* Resend button */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              type="button"
              disabled={resendTimer > 0 || isResending}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-tt-blue hover:text-tt-blue-dark disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {resendTimer > 0
                  ? `Renvoyer le code (${resendTimer}s)`
                  : 'Renvoyer un nouveau code'}
              </span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
