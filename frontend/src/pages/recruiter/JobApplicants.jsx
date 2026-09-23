import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Trophy,
  Sparkles,
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import { filesApi } from '../../api/files';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ApplicationStatusBadge, ScoringStatusBadge } from '../../components/shared/StatusBadge';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatScore, getInitials, getScoreColorClass } from '../../utils/formatters';

export const JobApplicants = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobsApi.getById(id),
          applicationsApi.applicantsForJob(id),
        ]);

        if (jobRes.success && jobRes.data) {
          setJob(jobRes.data);
        }

        if (appsRes.success && appsRes.data) {
          setApplicants(appsRes.data);
          setFilteredApplicants(appsRes.data);
        }
      } catch (err) {
        console.error('Failed to load applicants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let result = [...applicants];

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.applicant?.email?.toLowerCase().includes(term) ||
          a.resume?.fileName?.toLowerCase().includes(term)
      );
    }

    setFilteredApplicants(result);
  }, [statusFilter, searchTerm, applicants]);

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
        <Loader text="Chargement et classement des candidats..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux offres d'emploi</span>
        </Link>
      </div>

      {/* Header Banner */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tt-blue/10 text-tt-blue text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Tunisie Telecom</span>
              </span>
              <Badge variant="blue">{job?.contractType}</Badge>
              <span className="text-xs font-semibold text-slate-500">{job?.location}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidatures : {job?.title}
            </h1>

            <p className="text-xs text-slate-500">
              {applicants.length} {applicants.length > 1 ? 'candidatures reçues' : 'candidature reçue'} • Classées par score de matching IA
            </p>
          </div>

          {applicants.length > 0 && (
            <Button
              variant="gradient"
              onClick={() => setRankingModalOpen(true)}
              iconLeft={Trophy}
            >
              Ranking IA des Candidats
            </Button>
          )}
        </div>
      </Card>

      {/* Filter / Search Bar */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par email candidat ou CV..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Filtrer par statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-tt-blue/30"
            >
              <option value="all">Tous ({applicants.length})</option>
              <option value="pending">En attente</option>
              <option value="shortlisted">Présélectionnés</option>
              <option value="accepted">Acceptés</option>
              <option value="rejected">Non retenus</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applicants Table */}
      {filteredApplicants.length > 0 ? (
        <Card className="overflow-hidden shadow-soft border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rang</th>
                  <th className="py-3.5 px-5">Candidat</th>
                  <th className="py-3.5 px-4">Date de dépôt</th>
                  <th className="py-3.5 px-4">CV</th>
                  <th className="py-3.5 px-4 text-center">Score IA</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app, idx) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold text-xs ${idx === 0
                            ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400/30'
                            : idx === 1
                              ? 'bg-slate-200 text-slate-700'
                              : idx === 2
                                ? 'bg-amber-50 text-amber-800'
                                : 'text-slate-400'
                          }`}
                      >
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                    </td>

                    {/* Candidate Identity */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-tt-blue to-tt-cyan text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(app.applicant?.email)}
                        </div>
                        <div>
                          <Link
                            to={`/recruiter/applications/${app._id}`}
                            className="font-bold text-slate-900 hover:text-tt-blue transition-colors text-sm"
                          >
                            {app.applicant?.email?.split('@')[0]}
                          </Link>
                          <p className="text-[11px] text-slate-400">{app.applicant?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(app.appliedAt, { short: true })}
                    </td>

                    {/* Resume download */}
                    <td className="py-4 px-4">
                      {app.resume ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app.resume._id, app.resume.fileName)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-tt-blue text-slate-700 text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{app.resume.fileName}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* AI Match Score */}
                    <td className="py-4 px-4 text-center">
                      {app.matchScore !== null && app.matchScore !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-extrabold text-xs px-3 py-1 rounded-full border shadow-2xs ${app.matchScore >= 70
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.matchScore >= 40
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                        >
                          <Sparkles className="w-3 h-3 text-current" />
                          {formatScore(app.matchScore)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Calcul en cours</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <Link to={`/recruiter/applications/${app._id}`}>
                        <Button size="sm" variant="gradient" className="text-xs">
                          Évaluer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Users}
          title="Aucun candidat pour le moment"
          description="Les candidatures soumises pour cette offre s'afficheront ici avec le classement algorithmique par pertinence IA."
        />
      )}

      {/* APPLICANT RANKING MODAL (Inspired by Figure 5.8: Applicant ranking modal) */}
      <Modal
        isOpen={rankingModalOpen}
        onClose={() => setRankingModalOpen(false)}
        title="🏆 Classement IA des Candidats"
        subtitle={`Ranking calculé pour l'offre : ${job?.title}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {applicants.map((app, idx) => (
            <div
              key={app._id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/40 via-white to-blue-50/30 border border-slate-200/80 shadow-2xs hover:shadow-soft transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-tt-blue to-tt-cyan text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs border-2 border-white">
                  {getInitials(app.applicant?.email)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {app.applicant?.email?.split('@')[0]}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {app.applicant?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-lg font-black text-purple-700 tracking-tight">
                  {formatScore(app.matchScore)}
                </span>
                <Link to={`/recruiter/applications/${app._id}`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold">
                    Évaluer
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" onClick={() => setRankingModalOpen(false)} className="w-full">
            Fermer
          </Button>
        </div>
      </Modal>
    </div>
  );
};
