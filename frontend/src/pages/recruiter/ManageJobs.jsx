import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Users,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { JobStatusBadge } from '../../components/shared/StatusBadge';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.myJobs();
      if (res.success && res.data) {
        setJobs(res.data);
        setFilteredJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.location.toLowerCase().includes(term) ||
          j.department?.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(result);
  }, [statusFilter, searchTerm, jobs]);

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Êtes-vous certain de vouloir supprimer l'offre "${title}" ?`)) {
      return;
    }

    setDeletingId(jobId);
    setFeedback({ type: '', text: '' });

    try {
      await jobsApi.remove(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setFeedback({ type: 'success', text: `L'offre "${title}" a été supprimée.` });
    } catch (err) {
      const msg = err.response?.data?.message || 'Impossible de supprimer cette offre.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader text="Chargement de vos offres d'emploi..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestion des Offres d'Emploi
          </h1>
          <p className="text-sm text-slate-500">
            Toutes les offres de recrutement créées pour Tunisie Telecom
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <Button variant="gradient" iconLeft={PlusCircle}>
            Publier une nouvelle offre
          </Button>
        </Link>
      </div>

      {/* Feedback message */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success'
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

      {/* Filters Bar */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, département, ville..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-tt-blue/30"
            >
              <option value="all">Tous ({jobs.length})</option>
              <option value="active">Actives</option>
              <option value="draft">Brouillons</option>
              <option value="closed">Clôturées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table Card */}
      {filteredJobs.length > 0 ? (
        <Card className="overflow-hidden shadow-soft border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Titre du Poste</th>
                  <th className="py-3.5 px-4">Département</th>
                  <th className="py-3.5 px-4">Localisation</th>
                  <th className="py-3.5 px-4">Contrat</th>
                  <th className="py-3.5 px-4 text-center">Candidats</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Clôture</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="font-bold text-slate-900 hover:text-tt-blue transition-colors text-sm block"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {job.openPositions} {job.openPositions > 1 ? 'postes' : 'poste'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {job.department || 'Tunisie Telecom'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {job.location}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="blue">{job.contractType}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                        <span className="inline-flex items-center gap-1 font-extrabold text-xs px-2.5 py-1 rounded-full bg-blue-50 text-tt-blue border border-blue-200 hover:bg-blue-100 transition-colors">
                          <Users className="w-3.5 h-3.5" />
                          {job.applicantsCount || 0}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(job.closingDate, { short: true })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                          <Button size="sm" variant="gradient" className="text-xs">
                            Candidats
                          </Button>
                        </Link>
                        <Link to={`/recruiter/jobs/${job._id}/edit`}>
                          <Button size="sm" variant="outline" className="text-xs p-2">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === job._id}
                          onClick={() => handleDelete(job._id, job.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Aucune offre d'emploi trouvée"
          description="Créez une nouvelle offre pour attirer les meilleurs candidats chez Tunisie Telecom."
          actionLabel="Créer une offre"
          onAction={() => (window.location.href = '/recruiter/jobs/create')}
        />
      )}
    </div>
  );
};
