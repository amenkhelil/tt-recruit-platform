import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { CONTRACT_TYPES, TUNISIA_LOCATIONS } from '../../utils/constants';

export const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    missionText: '',
    department: '',
    location: 'Tunis',
    contractType: 'CDI',
    degree: 'Bac+5 / Diplôme National d\'Ingénieur',
    experienceYearsMin: 2,
    openPositions: 1,
    closingDate: '',
  });

  const [responsibilities, setResponsibilities] = useState([
    'Participer à la conception et à la mise en œuvre des solutions télécoms et digitales.',
    'Assurer la maintenance et l\'optimisation continue des infrastructures déployées.',
    'Collaborer avec les équipes transverses et les chefs de projet TT.',
  ]);
  const [newResp, setNewResp] = useState('');

  const [requiredSkills, setRequiredSkills] = useState([
    'Réseaux Télécom',
    'Linux',
    'Python',
    'Sécurité SI',
  ]);
  const [newSkill, setNewSkill] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  // Add/remove responsibilities
  const handleAddResp = (e) => {
    e.preventDefault();
    if (newResp.trim()) {
      setResponsibilities((prev) => [...prev, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleRemoveResp = (index) => {
    setResponsibilities((prev) => prev.filter((_, i) => i !== index));
  };

  // Add/remove skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setRequiredSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.length < 3) {
      setError('L\'intitulé du poste doit contenir au moins 3 caractères.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      setError('La description du poste doit comporter au moins 20 caractères.');
      return;
    }

    if (!formData.location) {
      setError('Veuillez spécifier la localisation du poste.');
      return;
    }

    if (!formData.closingDate) {
      setError('Veuillez spécifier une date limite de candidature future.');
      return;
    }

    const selectedDate = new Date(formData.closingDate);
    if (selectedDate <= new Date()) {
      setError('La date limite de candidature doit être dans le futur.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        missionText: formData.missionText.trim() || undefined,
        responsibilities,
        requiredSkills,
        degree: formData.degree.trim() || undefined,
        experienceYearsMin: Number(formData.experienceYearsMin) || 0,
        location: formData.location.trim(),
        contractType: formData.contractType,
        department: formData.department.trim() || undefined,
        openPositions: Number(formData.openPositions) || 1,
        closingDate: selectedDate.toISOString(),
      };

      const res = await jobsApi.create(payload);
      if (res.success) {
        navigate('/recruiter/jobs', {
          state: { message: `L'offre "${formData.title}" a été publiée avec succès !` },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Erreur lors de la création de l\'offre.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la gestion des offres</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publier une Offre d'Emploi Tunisie Telecom
        </h1>
        <p className="text-sm text-slate-500">
          Définissez les missions, responsabilités et compétences techniques qui alimenteront l'algorithme de scoring IA
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations Générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              1. Informations Générales
            </h3>

            <Input
              label="Intitulé du Poste"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ex. Ingénieur Réseaux & Sécurité Télécom"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Département / Direction"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="ex. Direction Réseaux Fixes & Mobiles"
              />

              <Select
                label="Gouvernorat / Région"
                name="location"
                value={formData.location}
                onChange={handleChange}
                options={TUNISIA_LOCATIONS}
                required
              />

              <Select
                label="Type de Contrat"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                options={CONTRACT_TYPES}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Diplôme / Niveau d'études"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="ex. Bac+5 / Ingénieur"
              />

              <Input
                label="Années d'expérience min."
                name="experienceYearsMin"
                type="number"
                min={0}
                max={50}
                value={formData.experienceYearsMin}
                onChange={handleChange}
                required
              />

              <Input
                label="Nombre de Postes Ouverts"
                name="openPositions"
                type="number"
                min={1}
                value={formData.openPositions}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Date Limite de Candidature"
              name="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={handleChange}
              required
              helperText="Date jusqu'à laquelle les candidats peuvent postuler"
            />
          </div>

          {/* Section 2: Description & Missions */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              2. Description & Missions
            </h3>

            <Textarea
              label="Description Complète du Poste"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Présentez le contexte du poste au sein de Tunisie Telecom..."
              rows={4}
              required
            />

            <Textarea
              label="Mission Principale"
              name="missionText"
              value={formData.missionText}
              onChange={handleChange}
              placeholder="Résumez la mission centrale attendue du futur collaborateur..."
              rows={2}
            />
          </div>

          {/* Section 3: Responsabilités */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              3. Responsabilités & Tâches ({responsibilities.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                placeholder="Ajouter une responsabilité (ex. Administrer les équipements Cisco et Juniper)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddResp(e);
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddResp} iconLeft={Plus}>
                Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="truncate pr-2">• {resp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResp(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Compétences Requises pour l'IA */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-tt-blue" />
                <span>4. Compétences Clés pour le Matching IA ({requiredSkills.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Utilisées pour le calcul des scores NLP
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence (ex. 5G, Docker, React, CCNA)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSkill} iconLeft={Plus}>
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-tt-blue text-xs font-semibold border border-blue-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="p-0.5 rounded hover:bg-blue-200/60"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/recruiter/jobs">
              <Button variant="ghost">Annuler</Button>
            </Link>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isLoading}
              iconLeft={Save}
            >
              Publier l'offre d'emploi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
