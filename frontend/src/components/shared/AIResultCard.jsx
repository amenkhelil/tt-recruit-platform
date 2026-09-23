import React from 'react';
import { Sparkles, Brain, CheckCircle2, AlertCircle, Clock, BookOpen, Cpu, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ScoreCircle } from './ScoreCircle';
import { ScoreBar } from './ScoreBar';
import { SkillTag } from './SkillTag';
import { Badge } from '../ui/Badge';
import { Loader } from '../ui/Loader';

export const AIResultCard = ({
  aiResult,
  scoringStatus = 'completed',
  candidateName = '',
  className = '',
}) => {
  // If scoring is in progress or pending
  if (scoringStatus === 'processing' || scoringStatus === 'pending') {
    return (
      <Card className={`overflow-hidden border-purple-200 bg-gradient-to-b from-purple-50/50 to-white ${className}`}>
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {scoringStatus === 'processing'
                ? 'Analyse IA en cours de traitement...'
                : 'En attente d\'analyse par le modèle IA'}
            </h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Notre moteur NLP compare en ce moment le profil du candidat avec les exigences du poste chez Tunisie Telecom.
            </p>
          </div>
          <Loader text="Calcul des scores sémantiques et matching des compétences..." size="sm" />
        </CardContent>
      </Card>
    );
  }

  // If scoring failed or no AI result
  if (scoringStatus === 'failed' || !aiResult) {
    return (
      <Card className={`border-rose-200 bg-rose-50/30 ${className}`}>
        <CardContent className="p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-base font-bold text-rose-900">
            Analyse IA non disponible
          </h4>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            Le microservice IA n'a pas pu traiter cette candidature (format de CV non lisible ou service temporairement indisponible).
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    finalScore = 0,
    semanticScore = 0,
    skillScore = 0,
    experienceScore = 0,
    matchedSkills = [],
    missingSkills = [],
    extractedYearsExperience = 0,
    requiredYearsExperience = 0,
    explanation = '',
    modelVersion = 'all-MiniLM-L6-v2',
  } = aiResult;

  return (
    <Card className={`overflow-hidden shadow-card border-slate-200/90 ${className}`}>
      {/* Header with AI Badge & Model Version */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-tt-navy to-tt-blue text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 sm:p-6 border-none">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-cyan-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-lg">
                Résultats du Matching IA
              </CardTitle>
              <Badge variant="gradient" size="sm">
                Score IA
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {candidateName ? `Évaluation pour ${candidateName}` : 'Adéquation profil / exigences du poste'}
            </p>
          </div>
        </div>

        {/* Model Version Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modèle : {modelVersion}</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Top Section: Score Circle & Dimension Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/60">
          {/* Main Global Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/80 pb-6 md:pb-0 md:pr-6">
            <ScoreCircle
              score={finalScore}
              size={135}
              strokeWidth={11}
              title="Score Global"
              subtitle="Matching Final"
            />
            <p className="text-xs text-center text-slate-500 mt-2">
              {finalScore >= 75
                ? '⭐ Profil hautement qualifié pour ce poste'
                : finalScore >= 50
                ? '👍 Profil correspondant aux attentes requises'
                : '⚠️ Correspondance partielle avec les critères'}
            </p>
          </div>

          {/* Sub-scores breakdown */}
          <div className="md:col-span-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-tt-blue" />
              <span>Détails des scores par dimension</span>
            </h4>

            <div className="space-y-3">
              <ScoreBar
                label="Score Sémantique (NLP)"
                score={semanticScore}
                description="Similarité sémantique entre le parcours du CV et la description de mission"
                color="blue"
              />

              <ScoreBar
                label="Score Compétences"
                score={skillScore}
                description="Adéquation directe des mots-clés techniques et hard skills requis"
                color="emerald"
              />

              <ScoreBar
                label="Score Expérience"
                score={experienceScore}
                description="Comparaison des années de pratique professionnelle par rapport au minimum exigé"
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Experience Comparison Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-blue-100 text-tt-blue">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Expérience Détectée</span>
              <p className="text-base font-bold text-slate-900">
                {extractedYearsExperience} {extractedYearsExperience > 1 ? 'ans' : 'an'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Expérience Requise</span>
              <p className="text-base font-bold text-slate-900">
                {requiredYearsExperience > 0
                  ? `${requiredYearsExperience} ${requiredYearsExperience > 1 ? 'ans min.' : 'an min.'}`
                  : 'Non spécifié / Débutant accepté'}
              </p>
            </div>
          </div>
        </div>

        {/* Skills Comparison: Matched vs Missing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-bold">
                Compétences Correspondantes ({matchedSkills.length})
              </h4>
            </div>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {matchedSkills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill} type="matched" size="md" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Aucune compétence spécifique identifiée dans le CV.
              </p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="p-5 rounded-2xl border border-rose-200/80 bg-rose-50/30 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <h4 className="text-sm font-bold">
                Compétences Manquantes ({missingSkills.length})
              </h4>
            </div>

            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {missingSkills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill} type="missing" size="md" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">
                ✨ Toutes les compétences requises ont été trouvées dans le profil !
              </p>
            )}
          </div>
        </div>

        {/* AI Explanation Note */}
        {explanation && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-purple-50/60 border border-blue-100 space-y-2">
            <div className="flex items-center space-x-2 text-tt-blue">
              <Info className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Explication Générée par l'IA
              </h4>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
