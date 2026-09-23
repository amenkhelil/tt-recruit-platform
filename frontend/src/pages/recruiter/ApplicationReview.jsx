import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
   User,
   Mail,
   Briefcase,
   Sparkles,
   MapPin,
   Calendar,
   Clock,
   ArrowLeft,
   FileText,
   Download,
   CheckCircle2,
   XCircle,
   AlertCircle,
   Building2,
   ExternalLink,
   ShieldCheck,
} from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { filesApi } from '../../api/files';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ApplicationStatusBadge, ScoringStatusBadge } from '../../components/shared/StatusBadge';
import { AIResultCard } from '../../components/shared/AIResultCard';
import { Loader } from '../../components/ui/Loader';
import { formatDate, getInitials } from '../../utils/formatters';

export const ApplicationReview = () => {
   const { id } = useParams();

   const [data, setData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
   const [feedback, setFeedback] = useState({ type: '', text: '' });
   const [error, setError] = useState('');

   const fetchApplication = async () => {
      try {
         const res = await applicationsApi.getById(id);
         if (res.success && res.data) {
            setData(res.data);
         }
      } catch (err) {
         setError('Impossible de charger les détails de cette candidature.');
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchApplication();
   }, [id]);

   const handleStatusChange = async (newStatus) => {
      setIsUpdatingStatus(true);
      setFeedback({ type: '', text: '' });

      try {
         const res = await applicationsApi.updateStatus(id, newStatus);
         if (res.success && res.data) {
            setData((prev) => ({
               ...prev,
               application: {
                  ...prev.application,
                  status: res.data.status,
                  statusHistory: res.data.statusHistory,
               },
            }));
            setFeedback({
               type: 'success',
               text: `Le statut de la candidature a été mis à jour sur "${newStatus}". Un email de notification automatique a été envoyé au candidat.`,
            });
         }
      } catch (err) {
         const msg = err.response?.data?.message || 'Erreur lors du changement de statut.';
         setFeedback({ type: 'error', text: msg });
      } finally {
         setIsUpdatingStatus(false);
      }
   };

   const handleDownloadResume = async (resumeId, fileName) => {
      try {
         const blob = await filesApi.downloadResumeBlob(resumeId);
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = fileName || 'CV.pdf';
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (err) {
         alert('Impossible de télécharger le CV.');
      }
   };

   if (isLoading) {
      return (
         <div className="py-16 flex justify-center">
            <Loader text="Chargement du dossier candidat & matching IA..." size="lg" />
         </div>
      );
   }

   if (error || !data?.application) {
      return (
         <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">{error || 'Dossier introuvable'}</h2>
            <Link to="/recruiter/dashboard">
               <Button variant="outline" iconLeft={ArrowLeft}>
                  Retour au tableau de bord
               </Button>
            </Link>
         </div>
      );
   }

   const { application, aiResult } = data;
   const currentStatus = application.status;

   return (
      <div className="max-w-5xl mx-auto space-y-8">
         {/* Back Link */}
         <div>
            <Link
               to={`/recruiter/jobs/${application.job?._id}/applicants`}
               className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
            >
               <ArrowLeft className="w-4 h-4" />
               <span>Retour à la liste des candidats de ce poste</span>
            </Link>
         </div>

         {/* Header Info Card */}
         <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-soft space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
               <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-tt-blue to-tt-cyan text-white text-xl font-extrabold flex items-center justify-center shrink-0 shadow-md">
                     {getInitials(application.applicant?.email)}
                  </div>

                  <div className="space-y-1">
                     <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                           {application.applicant?.email?.split('@')[0]}
                        </h1>
                        <ApplicationStatusBadge status={currentStatus} />
                        <ScoringStatusBadge status={application.scoringStatus} />
                     </div>

                     <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{application.applicant?.email}</span>
                     </p>

                     <p className="text-xs text-slate-500 pt-1">
                        Postulé pour : <strong className="text-slate-800">{application.job?.title}</strong> ({application.job?.location}) • {formatDate(application.appliedAt)}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-2 shrink-0">
                  {application.resume?._id && (
                     <Button
                        variant="outline"
                        size="md"
                        onClick={() =>
                           handleDownloadResume(application.resume._id, application.resume.fileName)
                        }
                        iconLeft={Download}
                     >
                        Télécharger le CV
                     </Button>
                  )}
               </div>
            </div>

            {/* Status Transition Control Panel */}
            <div className="space-y-3">
               <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Gestion du Statut de la Candidature
               </h3>

               {feedback.text && (
                  <div
                     className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success'
                           ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                           : 'bg-rose-50 border border-rose-200 text-rose-800'
                        }`}
                  >
                     {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                     ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                     )}
                     <span>{feedback.text}</span>
                  </div>
               )}

               <div className="flex flex-wrap gap-2.5">
                  {currentStatus === 'pending' && (
                     <>
                        <Button
                           variant="primary"
                           size="sm"
                           isLoading={isUpdatingStatus}
                           onClick={() => handleStatusChange('shortlisted')}
                           iconLeft={Sparkles}
                        >
                           Présélectionner le candidat
                        </Button>
                        <Button
                           variant="danger"
                           size="sm"
                           isLoading={isUpdatingStatus}
                           onClick={() => handleStatusChange('rejected')}
                           iconLeft={XCircle}
                        >
                           Refuser la candidature
                        </Button>
                     </>
                  )}

                  {currentStatus === 'shortlisted' && (
                     <>
                        <Button
                           variant="success"
                           size="sm"
                           isLoading={isUpdatingStatus}
                           onClick={() => handleStatusChange('accepted')}
                           iconLeft={CheckCircle2}
                        >
                           Accepter le candidat (Embauche)
                        </Button>
                        <Button
                           variant="danger"
                           size="sm"
                           isLoading={isUpdatingStatus}
                           onClick={() => handleStatusChange('rejected')}
                           iconLeft={XCircle}
                        >
                           Refuser la candidature
                        </Button>
                     </>
                  )}

                  {(currentStatus === 'accepted' || currentStatus === 'rejected') && (
                     <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
                        Cette candidature est au statut final : <strong>{currentStatus === 'accepted' ? 'Acceptée' : 'Non retenue'}</strong>.
                     </div>
                  )}
               </div>
            </div>
         </Card>

         {/* AI ANALYSIS SECTION */}
         <div className="space-y-4">
            <div>
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-tt-blue" />
                  <span>Évaluation et Matching IA</span>
               </h2>
               <p className="text-xs text-slate-500">
                  Détail du scoring calculé par le microservice IA de Tunisie Telecom
               </p>
            </div>

            <AIResultCard
               aiResult={aiResult}
               scoringStatus={application.scoringStatus}
               candidateName={application.applicant?.email?.split('@')[0]}
            />
         </div>

         {/* Cover Letter & Resume Details */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 bg-white border-slate-200/80">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-4 h-4 text-tt-blue" />
                  <span>Lettre de Motivation du Candidat</span>
               </h3>

               {application.coverLetter ? (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-slate-50 border border-slate-200/60 max-h-48 overflow-y-auto">
                     {application.coverLetter}
                  </p>
               ) : (
                  <p className="text-xs text-slate-400 italic p-4 text-center">
                     Le candidat n'a pas inclus de lettre de motivation.
                  </p>
               )}
            </Card>

            {/* Status History */}
            <Card className="p-6 space-y-4 bg-white border-slate-200/80">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-4 h-4 text-tt-blue" />
                  <span>Historique des Décisions RH</span>
               </h3>

               <div className="space-y-2 max-h-48 overflow-y-auto">
                  {application.statusHistory?.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <ApplicationStatusBadge status={item.status} />
                        <span className="text-slate-400 font-mono">
                           {formatDate(item.changedAt)}
                        </span>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
   );
};
