import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { JobCard } from '../../components/shared/JobCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { CardSkeleton } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { CONTRACT_TYPES, TUNISIA_LOCATIONS } from '../../utils/constants';

export const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [contractType, setContractType] = useState(searchParams.get('contractType') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 9,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (location) params.location = location;
      if (contractType) params.contractType = contractType;

      const res = await jobsApi.search(params);
      if (res.success) {
        setJobs(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Update URL search params
    const newParams = {};
    if (keyword.trim()) newParams.keyword = keyword.trim();
    if (location) newParams.location = location;
    if (contractType) newParams.contractType = contractType;
    if (page > 1) newParams.page = page;
    setSearchParams(newParams, { replace: true });
  }, [keyword, location, contractType, page]);

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setContractType('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(keyword.trim() || location || contractType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl hero-gradient p-8 sm:p-10 text-white relative overflow-hidden shadow-soft">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Offres Officielles Tunisie Telecom</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Toutes les Offres d'Emploi
          </h1>
          <p className="text-sm text-slate-300">
            Trouvez le poste qui correspond à vos aspirations et rejoignez nos équipes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 sm:p-6 shadow-soft bg-white border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Keyword Search */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mot-clé / Métier
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Ex. Réseau, React, Chef de projet, DevOps..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue transition-all"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Location filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Localisation
            </label>
            <Select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              options={TUNISIA_LOCATIONS}
              placeholder="Toutes les régions"
            />
          </div>

          {/* Contract Type filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contrat
            </label>
            <Select
              value={contractType}
              onChange={(e) => {
                setContractType(e.target.value);
                setPage(1);
              }}
              options={CONTRACT_TYPES}
              placeholder="Tous les contrats"
            />
          </div>
        </div>

        {/* Active filters badge row */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filtres actifs :</span>
              {keyword && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-tt-blue text-xs font-semibold">
                  "{keyword}"
                  <button type="button" onClick={() => setKeyword('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-tt-blue text-xs font-semibold">
                  {location}
                  <button type="button" onClick={() => setLocation('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {contractType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-tt-blue text-xs font-semibold">
                  {contractType}
                  <button type="button" onClick={() => setContractType('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <Button size="sm" variant="ghost" onClick={handleClearFilters} className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              Réinitialiser tous les filtres
            </Button>
          </div>
        )}
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">
          {meta.total} {meta.total > 1 ? 'offres disponibles' : 'offre disponible'}
        </span>
        {meta.totalPages > 1 && (
          <span>
            Page {meta.page} sur {meta.totalPages}
          </span>
        )}
      </div>

      {/* Job Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Aucune offre ne correspond à vos critères"
          description="Essayez d'élargir votre recherche en modifiant les filtres de mot-clé, région ou type de contrat."
          actionLabel="Effacer les filtres"
          onAction={handleClearFilters}
        />
      )}

      {/* Pagination Controls */}
      {!isLoading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            iconLeft={ChevronLeft}
          >
            Précédent
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  page === p
                    ? 'bg-tt-blue text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
            iconRight={ChevronRight}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};
