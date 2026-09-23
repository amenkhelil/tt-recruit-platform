export const APPLICATION_STATUSES = {
  pending: {
    label: 'En attente',
    description: 'Candidature reçue, en cours d\'examen',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dotClass: 'bg-amber-500',
  },
  shortlisted: {
    label: 'Présélectionné',
    description: 'Profil retenu pour les étapes suivantes',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    dotClass: 'bg-blue-500',
  },
  accepted: {
    label: 'Accepté',
    description: 'Candidature retenue avec succès',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  rejected: {
    label: 'Non retenu',
    description: 'Candidature non retenue pour ce poste',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dotClass: 'bg-rose-500',
  },
};

export const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'];

export const TUNISIA_LOCATIONS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 
  'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 
  'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili', 'Hybride / Télétravail'
];

export const EXTRACTION_STATUSES = {
  pending: {
    label: 'Extraction en cours...',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  completed: {
    label: 'Extraction terminée',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Échec extraction',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const SCORING_STATUSES = {
  pending: {
    label: 'En attente de scoring',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  processing: {
    label: 'Analyse IA en cours...',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
  },
  completed: {
    label: 'Matching calculé',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Échec du scoring',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};
