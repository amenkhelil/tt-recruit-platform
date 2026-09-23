import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Loader } from '../../components/ui/Loader';
import { CONTRACT_TYPES, TUNISIA_LOCATIONS } from '../../utils/constants';

export const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    missionText: '',
    department: '',
    location: '',
    contractType: 'CDI',
    degree: '',
    experienceYearsMin: 0,
    openPositions: 1,
    closingDate: '',
    status: 'active',
  });

  const [responsibilities, setResponsibilities] = useState([]);
  const [newResp, setNewResp] = useState('');

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getById(id);
        if (res.success && res.data) {
          const j = res.data;
          setFormData({
            title: j.title || '',
            description: j.description || '',
            missionText: j.missionText || '',
            department: j.department || '',
            location: j.location || 'Tunis',
            contractType: j.contractType || 'CDI',
            degree: j.degree || '',
            experienceYearsMin: j.experienceYearsMin || 0,
            openPositions: j.openPositions || 1,
            closingDate: j.closingDate ? j.closingDate.split('T')[0] : '',
            status: j.status || 'active',
          });
          setResponsibilities(j.responsibilities || []);
          setRequiredSkills(j.requiredSkills || []);
        }
      } catch (err) {
        setError('Impossible de charger cette offre.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

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
      setError('L\'intitulé du poste doit comporter au moins 3 caractères.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      setError('La description du poste doit comporter au moins 20 caractères.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        missionText: formData.missionText.trim(),
        responsibilities,
        requiredSkills,
        degree: formData.degree.trim(),
        experienceYearsMin: Number(formData.experienceYearsMin) || 0,
        location: formData.location.trim(),
        contractType: formData.contractType,
        department: formData.department.trim(),
        openPositions: Number(formData.openPositions) || 1,
        status: formData.status,
      };

      if (formData.closingDate) {
        payload.closingDate = new Date(formData.closingDate).toISOString();
      }

      const res = await jobsApi.update(id, payload);
      if (res.success) {
        navigate('/recruiter/jobs', {
          state: { message: `L'offre "${formData.title}" a été mise à jour avec succès.` },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'offre.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader text="Chargement de l'offre d'emploi..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux offres</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Modifier l'Offre d'Emploi
          </h1>
          <p className="text-sm text-slate-500">{formData.title}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                1. Détails & Statut
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Statut de publication :</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800"
                >
                  <option value="active">Active (Publiée)</option>
                  <option value="draft">Brouillon</option>
                  <option value="closed">Clôturée</option>
                  <option value="expired">Expirée</option>
                </select>
              </div>
            </div>

            <Input
              label="Intitulé du Poste"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Département"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />

              <Select
                label="Localisation"
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
                label="Diplôme"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              />

              <Input
                label="Expérience min. (années)"
                name="experienceYearsMin"
                type="number"
                min={0}
                value={formData.experienceYearsMin}
                onChange={handleChange}
              />

              <Input
                label="Nombre de Postes"
                name="openPositions"
                type="number"
                min={1}
                value={formData.openPositions}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Date Limite"
              name="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              2. Description & Missions
            </h3>

            <Textarea
              label="Description Complète"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />

            <Textarea
              label="Mission Principale"
              name="missionText"
              value={formData.missionText}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Responsibilities */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              3. Responsabilités ({responsibilities.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                placeholder="Ajouter une tâche..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddResp} iconLeft={Plus}>
                Ajouter
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
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

          {/* Skills */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              4. Compétences Clés ({requiredSkills.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue"
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

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/recruiter/jobs">
              <Button variant="ghost">Annuler</Button>
            </Link>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isSaving}
              iconLeft={Save}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
