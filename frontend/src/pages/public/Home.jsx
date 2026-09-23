import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Briefcase,
  Brain,
  FileCheck2,
  Bell,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { JobCard } from '../../components/shared/JobCard';
import { CardSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isJobseeker } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const quickTags = [
    'Ingénieur Télécom',
    'Développeur React/Node',
    'Chef de Projet IT',
    'Data Scientist',
    'Sécurité Réseau',
    'DevOps 5G',
  ];

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const res = await jobsApi.search({ limit: 6 });
        if (res.success && res.data) {
          setRecentJobs(res.data);
        }
      } catch (err) {
        console.error('Failed to load recent jobs:', err);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchRecentJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION (Inspired by Figure 3.4) */}
      <section className="relative overflow-hidden hero-gradient text-white py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Background glow & blur circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-tt-blue/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Plateforme Officielle Tunisie Telecom</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              TUNISIE TELECOM <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                RECRUTE LES TALENTS
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Rejoignez l'opérateur national de référence en Tunisie. Déposez votre CV, complétez votre profil et découvrez vos opportunités sur-mesure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/jobs">
                <Button size="lg" variant="gradient" iconRight={ArrowRight}>
                  Explorer les opportunités
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    Déposer mon CV
                  </Button>
                </Link>
              )}
              {isAuthenticated && isJobseeker && (
                <Link to="/candidate/resumes">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    Mon CV
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Recruitment Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="relative rounded-3xl p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5 animate-float">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-tt-blue/60 text-cyan-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Tunisie Telecom</h4>
                      <p className="text-[11px] text-cyan-200">Rejoignez-nous</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    Carrières
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Opportunités de carrière</span>
                    <span className="text-emerald-400 font-bold">✓ Diverses</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Évolution professionnelle</span>
                    <span className="text-cyan-300 font-bold">✓ Accompagnée</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Environnement innovant</span>
                    <span className="text-indigo-300 font-bold">✓ Stimulant</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-300">
                  ⚡ Bâtissons l'avenir ensemble
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & QUICK TAGS SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-20">
        <Card className="p-4 sm:p-6 shadow-hover bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Rechercher un poste, une compétence ou une ville (ex. Réseau, Tunis, CDI)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue transition-all"
              />
            </div>
            <Button type="submit" variant="gradient" size="lg" className="sm:w-auto w-full">
              Rechercher
            </Button>
          </form>

          {/* Quick filter pills */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              Recherches populaires :
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-tt-blue text-slate-600 text-xs font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </Card>
      </section>

      {/* 3. HOW IT WORKS / SERVICES (Inspired by Figure 3.4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-tt-blue text-xs font-extrabold uppercase tracking-wider">
            Fonctionnalités Clés
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            De la recherche d'offres à la candidature, une expérience fluide conçue pour vous connecter aux meilleures opportunités de Tunisie Telecom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card hover className="p-6 space-y-4 border-slate-200/80">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-tt-blue flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Explorer les Offres TT</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consultez l'ensemble des offres officielles de Tunisie Telecom par direction, région, type de contrat et niveau d'expérience requis.
            </p>
          </Card>

          <Card hover className="p-6 space-y-4 border-slate-200/80">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Déposez votre CV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Téléversez votre CV et complétez votre profil en quelques clics pour vous démarquer auprès de nos recruteurs.
            </p>
          </Card>

          <Card hover className="p-6 space-y-4 border-slate-200/80">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Postulez en un clic</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Suivez l'état de vos candidatures en temps réel et préparez-vous pour vos entretiens avec nos équipes.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. RECENT JOBS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-tt-blue uppercase tracking-wider">
              Recrutements Actuels
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Dernières Opportunités chez Tunisie Telecom
            </h2>
          </div>
          <Link to="/jobs">
            <Button variant="outline" iconRight={ArrowRight}>
              Voir toutes les offres
            </Button>
          </Link>
        </div>

        {isLoadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-slate-50 border-dashed">
            <p className="text-sm text-slate-500">
              Aucune offre d'emploi n'est disponible pour le moment.
            </p>
          </Card>
        )}
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl hero-gradient p-8 sm:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-hover">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Prêt à Façonner l'Avenir des Télécoms en Tunisie ?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Créez votre profil en 2 minutes, déposez votre CV et accédez aux meilleures opportunités de carrière au sein de Tunisie Telecom.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/register">
                <Button size="lg" variant="gradient" iconRight={ArrowRight}>
                  Commencer maintenant
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Consulter les postes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
