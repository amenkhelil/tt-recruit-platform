import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  AlignLeft,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { filesApi } from '../../api/files';
import { formatDate } from '../../utils/formatters';

const STATUS_MAP = {
  pending: { 
    label: 'En attente', 
    variant: 'slate',
    icon: Clock,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    desc: 'Votre candidature est en cours de réception par nos équipes de recrutement.'
  },
  shortlisted: { 
    label: 'Présélectionné', 
    variant: 'blue',
    icon: CheckCircle2,
    color: 'text-tt-blue',
    bgColor: 'bg-blue-100',
    desc: 'Félicitations ! Votre profil a retenu notre attention. Vous serez contacté prochainement.'
  },
  accepted: { 
    label: 'Accepté', 
    variant: 'emerald',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    desc: 'Candidature retenue ! Bienvenue chez Tunisie Telecom.'
  },
  rejected: { 
    label: 'Refusé', 
    variant: 'rose',
    icon: XCircle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    desc: 'Malgré la qualité de votre profil, nous ne pouvons donner suite à votre candidature pour le moment.'
  },
};

export const ApplicationDetail = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await applicationsApi.getById(id);
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        setError('Impossible de charger les détails de cette candidature.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex justify-center">
        <Loader text="Chargement de votre candidature..." size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{error || 'Candidature introuvable'}</h2>
        <Link to="/candidate/applications">
          <Button variant="outline" iconLeft={ArrowLeft}>
            Retour à mes candidatures
          </Button>
        </Link>
      </div>
    );
  }

  const { job, resume, status, appliedAt, coverLetter } = application;
  const statusConfig = STATUS_MAP[status] || STATUS_MAP.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link
          to="/candidate/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des candidatures</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <Card className="p-6 sm:p-8 space-y-5 bg-white border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    <Building2 className="w-3 h-3" />
                    Tunisie Telecom
                  </span>
                </div>
                
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {job?.title || 'Poste non disponible'}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job?.location || 'Localisation non spécifiée'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Postulé le {formatDate(appliedAt)}
                  </span>
                </div>
              </div>
              
              {job?._id && (
                <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto text-right">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-tt-blue hover:underline"
                  >
                    Voir l'offre d'emploi originale
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Documents Submitted */}
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-tt-blue" />
              <span>Documents fournis</span>
            </h2>

            <div className="space-y-6">
              {/* Resume */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  CV Transmis
                </h3>
                {resume ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-tt-blue">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{resume.fileName}</p>
                        <p className="text-[10px] text-slate-500">Version du {formatDate(resume.uploadedAt)}</p>
                      </div>
                    </div>
                    <a
                      href={filesApi.getResumeUrl(resume.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-tt-blue hover:underline"
                    >
                      Consulter
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">CV indisponible ou supprimé.</p>
                )}
              </div>

              {/* Cover Letter */}
              {coverLetter && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft className="w-4 h-4 text-slate-400" />
                    Lettre de motivation
                  </h3>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {coverLetter}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Status Status widget */}
        <div className="space-y-6">
          <Card className="p-6 relative overflow-hidden bg-white shadow-card border-slate-200/80">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200/80 pb-3 mb-5">
              État de la Candidature
            </h3>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${statusConfig.bgColor} ${statusConfig.color}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
                {statusConfig.desc}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
