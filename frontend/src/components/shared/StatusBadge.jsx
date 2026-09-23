import React from 'react';
import { Badge } from '../ui/Badge';
import { APPLICATION_STATUSES, EXTRACTION_STATUSES, SCORING_STATUSES } from '../../utils/constants';

export const ApplicationStatusBadge = ({ status }) => {
  const meta = APPLICATION_STATUSES[status] || {
    label: status,
    variant: 'slate',
  };

  const variantMap = {
    pending: 'amber',
    shortlisted: 'blue',
    accepted: 'emerald',
    rejected: 'rose',
  };

  return (
    <Badge variant={variantMap[status] || 'slate'} dot>
      {meta.label}
    </Badge>
  );
};

export const ExtractionStatusBadge = ({ status }) => {
  const meta = EXTRACTION_STATUSES[status] || {
    label: status,
  };

  const variantMap = {
    pending: 'amber',
    completed: 'emerald',
    failed: 'rose',
  };

  return (
    <Badge variant={variantMap[status] || 'slate'} dot={status === 'pending'}>
      {meta.label}
    </Badge>
  );
};

export const ScoringStatusBadge = ({ status }) => {
  const meta = SCORING_STATUSES[status] || {
    label: status,
  };

  const variantMap = {
    pending: 'slate',
    processing: 'purple',
    completed: 'emerald',
    failed: 'rose',
  };

  return (
    <Badge variant={variantMap[status] || 'slate'} dot={status === 'processing'}>
      {meta.label}
    </Badge>
  );
};

export const JobStatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Active', variant: 'emerald' },
    draft: { label: 'Brouillon', variant: 'slate' },
    closed: { label: 'Clôturée', variant: 'rose' },
    expired: { label: 'Expirée', variant: 'amber' },
  };

  const current = map[status] || { label: status, variant: 'slate' };

  return <Badge variant={current.variant}>{current.label}</Badge>;
};
