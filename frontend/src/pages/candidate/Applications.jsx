import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, Building2, ChevronRight, FileText } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader, CardSkeleton } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_MAP = {
  pending: { label: 'En attente', variant: 'slate' },
  shortlisted: { label: 'Présélectionné', variant: 'blue' },
  accepted: { label: 'Accepté', variant: 'emerald' },
  rejected: { label: 'Refusé', variant: 'rose' },
};

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationsApi.myApplications();
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mes Candidatures</h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivez l'état d'avancement de vos candidatures chez Tunisie Telecom.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" size="sm" iconLeft={Briefcase}>
            Explorer d'autres offres
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.job;
            const statusConfig = STATUS_MAP[app.status] || STATUS_MAP.pending;

            return (
              <Card key={app._id} className="p-5 hover:border-tt-blue/30 transition-all shadow-sm hover:shadow-md bg-white flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{job?.title || 'Poste supprimé'}</h3>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Tunisie Telecom {job?.department ? `- ${job.department}` : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job?.location || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Postulé le {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                  <Link to={`/jobs/${job?._id}`}>
                    <Button variant="ghost" size="sm" className="w-full sm:w-auto" iconRight={ChevronRight}>
                      Voir l'offre
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Aucune candidature"
          description="Vous n'avez pas encore postulé à une offre d'emploi."
          actionLabel="Voir les offres"
          onAction={() => window.location.href = '/jobs'}
        />
      )}
    </div>
  );
};
