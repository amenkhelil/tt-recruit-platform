import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  Building2,
  Share2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Sparkles,
  Plus,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { resumesApi } from '../../api/resumes';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { SkillTag } from '../../components/shared/SkillTag';
import { Loader } from '../../components/ui/Loader';
import { FileUpload } from '../../components/shared/FileUpload';
import { formatDate } from '../../utils/formatters';

export const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isJobseeker, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(null);

  // Quick inline resume upload
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getById(id);
        if (res.success && res.data) {
          setJob(res.data);
        }
      } catch (err) {
        setError('Cette offre d\'emploi est introuvable ou a été clôturée.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const loadUserResumes = async () => {
    if (!isAuthenticated || !isJobseeker) return;
    try {
      const res = await resumesApi.list();
      if (res.success && res.data) {
        setUserResumes(res.data);
        const primary = res.data.find((r) => r.isPrimary) || res.data[0];
        if (primary) setSelectedResumeId(primary._id);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenApplyModal = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    setApplyError('');
    setApplySuccess(null);
    await loadUserResumes();
    setApplyModalOpen(true);
  };

  const handleInlineResumeUpload = async (file) => {
    if (!file) return;
    setIsUploadingResume(true);
    setApplyError('');
    try {
      const res = await resumesApi.upload(file);
      if (res.success && res.data) {
        await loadUserResumes();
        setSelectedResumeId(res.data._id);
        setShowUploadResume(false);
      }
    } catch (err) {
      setApplyError('Échec de l\'upload du CV. Veuillez réessayer.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setApplyError('Veuillez sélectionner un CV avant de postuler.');
      return;
    }

    setIsSubmittingApp(true);
    setApplyError('');

    try {
      const res = await applicationsApi.apply({
        jobId: job._id,
        resumeId: selectedResumeId,
        coverLetter: coverLetter.trim() || undefined,
      });

      if (res.success && res.data) {
        setApplySuccess(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Une erreur est survenue lors de l\'envoi de votre candidature.';
      setApplyError(msg);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <Loader text="Chargement des détails de l'offre..." size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Offre introuvable'}</h2>
        <Link to="/jobs">
          <Button variant="outline" iconLeft={ArrowLeft}>
            Retour aux offres
          </Button>
        </Link>
      </div>
    );
  }

  const isExpired = new Date(job.closingDate) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des offres</span>
        </Link>
      </div>

      {/* Header Banner Card */}
      <Card className="p-6 sm:p-8 shadow-card border-slate-200/80 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tt-blue/10 text-tt-blue text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Tunisie Telecom</span>
              </span>
              <Badge variant="blue">{job.contractType}</Badge>
              {job.department && (
                <span className="text-xs text-slate-600 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                  {job.department}
                </span>
              )}
              {job.status !== 'active' && (
                <Badge variant={job.status === 'closed' ? 'rose' : 'slate'}>
                  {job.status}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-tt-blue" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-tt-blue" />
                {job.experienceYearsMin > 0 ? `${job.experienceYearsMin} ans min.` : 'Débutant accepté'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-tt-blue" />
                {job.openPositions} {job.openPositions > 1 ? 'postes ouverts' : 'poste ouvert'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-tt-blue" />
                Date limite : <strong className="text-slate-800">{formatDate(job.closingDate)}</strong>
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {isRecruiter ? (
              <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                <Button size="lg" variant="gradient" className="w-full">
                  Voir les candidats ({job.applicantsCount || 0})
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="gradient"
                disabled={isExpired || job.status !== 'active'}
                onClick={handleOpenApplyModal}
                iconLeft={Send}
                className="w-full shadow-md"
              >
                {isExpired ? 'Offre expirée' : 'Postuler maintenant'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Grid: Job Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Job Body */}
        <div className="lg:col-span-8 space-y-8">
          {/* Description */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-tt-blue" />
              <span>Description du Poste</span>
            </h2>
            <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </Card>

          {/* Missions */}
          {job.missionText && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-tt-blue" />
                <span>Missions Principales</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {job.missionText}
              </p>
            </Card>
          )}

          {/* Responsibilities list */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Responsabilités & Tâches</span>
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-tt-blue mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-tt-blue" />
                <span>Compétences Requises</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {job.requiredSkills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill} type="neutral" size="md" />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: Summary Widget & Company Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Details Card */}
          <Card className="p-6 space-y-5 bg-gradient-to-br from-white to-blue-50/40">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200/80 pb-3">
              Aperçu du Poste
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Entreprise :</span>
                <span className="font-bold text-slate-900">Tunisie Telecom</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Type de contrat :</span>
                <Badge variant="blue">{job.contractType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Localisation :</span>
                <span className="font-bold text-slate-900">{job.location}</span>
              </div>
              {job.degree && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Niveau de diplôme :</span>
                  <span className="font-bold text-slate-900">{job.degree}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expérience requise :</span>
                <span className="font-bold text-slate-900">
                  {job.experienceYearsMin > 0 ? `${job.experienceYearsMin} ans` : 'Débutant accepté'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Postes disponibles :</span>
                <span className="font-bold text-slate-900">{job.openPositions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date de clôture :</span>
                <span className="font-bold text-rose-600">{formatDate(job.closingDate)}</span>
              </div>
            </div>

            {!isRecruiter && (
              <div className="pt-2">
                <Button
                  variant="gradient"
                  size="md"
                  disabled={isExpired || job.status !== 'active'}
                  onClick={handleOpenApplyModal}
                  className="w-full"
                >
                  Postuler à ce poste
                </Button>
              </div>
            )}
          </Card>


        </div>
      </div>

      {/* APPLICATION MODAL */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Candidature : ${job.title}`}
        subtitle="Postuler auprès de Tunisie Telecom"
        maxWidth="max-w-xl"
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Candidature Transmise avec Succès !
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Votre candidature pour le poste de <strong>{job.title}</strong> a été enregistrée.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={`/candidate/applications/${applySuccess._id}`}>
                <Button variant="gradient" className="w-full sm:w-auto">
                  Suivre ma candidature
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setApplyModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-5">
            {applyError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {/* Resume Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">
                  Sélectionner votre CV (Format PDF)
                </label>
                <button
                  type="button"
                  onClick={() => setShowUploadResume(!showUploadResume)}
                  className="text-xs font-bold text-tt-blue hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showUploadResume ? 'Annuler' : 'Ajouter un nouveau CV'}</span>
                </button>
              </div>

              {showUploadResume ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <FileUpload
                    onFileSelect={handleInlineResumeUpload}
                    isLoading={isUploadingResume}
                    label="Déposer un nouveau CV pour cette candidature"
                  />
                </div>
              ) : userResumes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userResumes.map((r) => (
                    <label
                      key={r._id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedResumeId === r._id
                          ? 'border-tt-blue bg-blue-50/60 ring-2 ring-tt-blue/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="radio"
                          name="selectedResume"
                          value={r._id}
                          checked={selectedResumeId === r._id}
                          onChange={() => setSelectedResumeId(r._id)}
                          className="h-4 w-4 text-tt-blue focus:ring-tt-blue border-slate-300"
                        />
                        <FileText className="w-5 h-5 text-tt-blue shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {r.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Ajouté le {formatDate(r.uploadedAt, { short: true })}
                          </p>
                        </div>
                      </div>

                      {r.isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-tt-blue/10 text-tt-blue shrink-0">
                          Principal
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">
                    Vous n'avez pas encore téléversé de CV sur votre profil.
                  </p>
                  <FileUpload
                    onFileSelect={handleInlineResumeUpload}
                    isLoading={isUploadingResume}
                    label="Uploader un CV maintenant"
                  />
                </div>
              )}
            </div>

            {/* Optional Cover Letter */}
            <Textarea
              label="Lettre de motivation (Optionnel)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Expliquez brièvement vos motivations pour rejoindre Tunisie Telecom..."
              rows={3}
              maxLength={3000}
            />

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setApplyModalOpen(false)}
                disabled={isSubmittingApp}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="gradient"
                isLoading={isSubmittingApp}
                iconRight={Send}
                disabled={!selectedResumeId}
              >
                Confirmer ma candidature
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
