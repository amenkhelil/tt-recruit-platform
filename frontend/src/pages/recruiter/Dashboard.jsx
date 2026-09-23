import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  PlusCircle,
  TrendingUp,
  Building2,
  ArrowRight,
  Eye,
  Edit,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { JobStatusBadge } from '../../components/shared/StatusBadge';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

export const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [statsRes, jobsRes] = await Promise.all([
          jobsApi.stats(),
          jobsApi.myJobs(),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (jobsRes.success && jobsRes.data) {
          setMyJobs(jobsRes.data);
        }
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader text="Chargement du tableau de bord Recruteur TT..." size="lg" />
      </div>
    );
  }

  const {
    jobsCount = 0,
    activeJobsCount = 0,
    applicationsCount = 0,
    pendingCount = 0,
    shortlistedCount = 0,
    acceptedCount = 0,
    rejectedCount = 0,
  } = stats || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl hero-gradient text-white shadow-soft">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Portail Recruteur Tunisie Telecom</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tableau de Bord RH & Recrutement
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Supervisez vos offres d'emploi, évaluez les candidats et accédez aux analyses IA
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <Button size="lg" variant="gradient" iconLeft={PlusCircle} className="bg-white text-tt-blue hover:bg-slate-50 border border-white">
            Publier une nouvelle offre
          </Button>
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Offres TT</span>
            <div className="p-2 rounded-xl bg-blue-50 text-tt-blue">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{jobsCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {activeJobsCount} actives actuellement
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Candidatures</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{applicationsCount}</p>
          <span className="text-[11px] text-slate-400">Reçues sur vos offres</span>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">En attente</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-slate-400">À évaluer par les RH</span>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Présélectionnées</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{shortlistedCount}</p>
          <span className="text-[11px] text-slate-400">Retenues pour entretien</span>
        </Card>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-bold">Candidatures Acceptées</span>
              <p className="text-xs text-emerald-600">Profils retenus pour embauche</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700">{acceptedCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-rose-800 font-bold">Candidatures Non Retenues</span>
              <p className="text-xs text-rose-600">Candidatures rejetées</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-700">{rejectedCount}</span>
        </div>
      </div>

      {/* Recent Posted Jobs Table */}
      <Card className="overflow-hidden shadow-soft border-slate-200/80 bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Mes Offres de Recrutement Tunisie Telecom</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Gérez vos offres publiées et accédez au ranking IA des candidats
            </p>
          </div>
          <Link to="/recruiter/jobs">
            <Button size="sm" variant="outline">
              Voir toutes mes offres ({myJobs.length})
            </Button>
          </Link>
        </CardHeader>

        {myJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Titre de l'offre</th>
                  <th className="py-3.5 px-4">Localisation</th>
                  <th className="py-3.5 px-4">Contrat</th>
                  <th className="py-3.5 px-4 text-center">Candidats</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Date limite</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myJobs.slice(0, 5).map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="font-bold text-slate-900 hover:text-tt-blue transition-colors block text-sm"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {job.department || 'Tunisie Telecom'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{job.location}</td>
                    <td className="py-4 px-4">
                      <Badge variant="blue">{job.contractType}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-tt-blue font-extrabold text-xs">
                        {job.applicantsCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(job.closingDate, { short: true })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                          <Button size="sm" variant="primary" className="text-xs">
                            Candidats
                          </Button>
                        </Link>
                        <Link to={`/recruiter/jobs/${job._id}/edit`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Modifier
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="Aucune offre publiée pour le moment"
            description="Commencez par créer votre première offre d'emploi pour Tunisie Telecom."
            actionLabel="Créer une offre"
            onAction={() => (window.location.href = '/recruiter/jobs/create')}
          />
        )}
      </Card>
    </div>
  );
};
