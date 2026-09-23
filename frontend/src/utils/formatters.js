export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: options.short ? 'short' : 'long',
      year: 'numeric',
      ...options,
    }).format(date);
  } catch {
    return '—';
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return formatDate(dateString, { short: true });
  } catch {
    return '—';
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Ko';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatScore = (score) => {
  if (score === null || score === undefined) return '—';
  return `${Math.round(score)}%`;
};

export const getScoreColorClass = (score) => {
  if (score === null || score === undefined) return 'text-slate-400';
  if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-rose-600 bg-rose-50 border-rose-200';
};

export const getInitials = (name) => {
  if (!name) return 'TT';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};
