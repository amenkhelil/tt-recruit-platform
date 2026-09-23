import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Check, AlertCircle, Eye } from 'lucide-react';
import { resumesApi } from '../../api/resumes';
import { filesApi } from '../../api/files';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader, CardSkeleton } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileUpload } from '../../components/shared/FileUpload';
import { formatDate } from '../../utils/formatters';

export const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await resumesApi.list();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err) {
      setError('Impossible de charger vos CVs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await resumesApi.upload(file);
      if (res.success && res.data) {
        setSuccess('Votre CV a été ajouté avec succès.');
        setShowUpload(false);
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'upload du CV.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce CV ?')) return;

    try {
      const res = await resumesApi.delete(id);
      if (res.success) {
        setSuccess('CV supprimé avec succès.');
        fetchResumes();
      }
    } catch (err) {
      setError('Échec de la suppression du CV.');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      const res = await resumesApi.setPrimary(id);
      if (res.success) {
        setSuccess('CV défini comme principal.');
        fetchResumes();
      }
    } catch (err) {
      setError('Impossible de définir ce CV comme principal.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mes CVs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos Curriculum Vitae pour postuler aux offres de Tunisie Telecom.
          </p>
        </div>
        {!showUpload && (
          <Button variant="gradient" size="sm" iconLeft={Plus} onClick={() => setShowUpload(true)}>
            Ajouter un CV
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {showUpload && (
        <Card className="p-6 bg-slate-50 border-dashed border-2 border-slate-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700">Téléverser un nouveau CV (PDF)</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Annuler
            </button>
          </div>
          <FileUpload
            onFileSelect={handleUpload}
            isLoading={isUploading}
            label="Déposez votre CV au format PDF ici"
          />
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((resume) => (
            <Card key={resume._id} className={`p-5 flex flex-col gap-4 transition-all ${resume.isPrimary ? 'border-tt-blue bg-blue-50/20 ring-1 ring-tt-blue/20' : 'hover:border-slate-300 bg-white'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${resume.isPrimary ? 'bg-tt-blue/10 text-tt-blue' : 'bg-slate-100 text-slate-500'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate" title={resume.fileName}>
                      {resume.fileName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ajouté le {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                {resume.isPrimary && (
                  <span className="shrink-0 px-2.5 py-1 rounded-md bg-tt-blue/10 text-tt-blue text-[10px] font-bold uppercase tracking-wider">
                    Principal
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <div className="flex gap-2">
                  <a
                    href={filesApi.getResumeUrl(resume.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-tt-blue transition-colors"
                    title="Voir le CV"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Supprimer ce CV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {!resume.isPrimary && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(resume._id)} className="text-xs text-tt-blue hover:bg-blue-50">
                    Définir comme principal
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Aucun CV enregistré"
          description="Téléversez votre premier CV pour postuler facilement aux offres d'emploi."
          actionLabel="Ajouter un CV"
          onAction={() => setShowUpload(true)}
        />
      )}
    </div>
  );
};
