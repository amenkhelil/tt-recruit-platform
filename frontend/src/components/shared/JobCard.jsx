import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users, ArrowRight, Building2, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SkillTag } from './SkillTag';
import { formatDate } from '../../utils/formatters';

export const JobCard = ({ job, isRecruiterView = false, onEdit, onDelete }) => {
  const {
    _id,
    title,
    location,
    contractType,
    department,
    requiredSkills = [],
    experienceYearsMin = 0,
    openPositions = 1,
    closingDate,
    createdAt,
    applicantsCount = 0,
    status = 'active',
  } = job;

  const isExpired = new Date(closingDate) < new Date();

  return (
    <Card hover className="flex flex-col justify-between overflow-hidden group border-slate-200/90 transition-all duration-300">
      <div className="p-6 space-y-4">
        {/* Top badges & status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tt-blue/10 text-tt-blue text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Tunisie Telecom</span>
            </span>
            <Badge variant="blue">{contractType}</Badge>
            {department && (
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                {department}
              </span>
            )}
          </div>

          {status !== 'active' && (
            <Badge variant={status === 'closed' ? 'rose' : 'slate'}>
              {status}
            </Badge>
          )}
        </div>

        {/* Title */}
        <div>
          <Link
            to={isRecruiterView ? `/recruiter/jobs/${_id}/applicants` : `/jobs/${_id}`}
            className="block text-lg font-bold text-slate-900 group-hover:text-tt-blue transition-colors line-clamp-2"
          >
            {title}
          </Link>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {experienceYearsMin > 0 ? `${experienceYearsMin} ans d'exp.` : 'Tous niveaux'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {openPositions} {openPositions > 1 ? 'postes ouverts' : 'poste ouvert'}
            </span>
          </div>
        </div>

        {/* Skills preview */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {requiredSkills.slice(0, 4).map((skill, idx) => (
              <SkillTag key={idx} skill={skill} type="neutral" size="sm" />
            ))}
            {requiredSkills.length > 4 && (
              <span className="text-xs font-semibold text-slate-400 self-center">
                +{requiredSkills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer info & CTA */}
      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex flex-col text-[11px] text-slate-400">
          <span>Date limite :</span>
          <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>
            {formatDate(closingDate, { short: true })}
          </span>
        </div>

        {isRecruiterView ? (
          <div className="flex items-center gap-2">
            <Link to={`/recruiter/jobs/${_id}/applicants`}>
              <Button size="sm" variant="outline" className="text-xs">
                Candidats ({applicantsCount})
              </Button>
            </Link>
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={() => onEdit(job)} className="text-xs">
                Modifier
              </Button>
            )}
          </div>
        ) : (
          <Link to={`/jobs/${_id}`}>
            <Button size="sm" variant="primary" iconRight={ArrowRight} className="text-xs">
              Consulter
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};
