import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Upload, Save, AlertCircle, CheckCircle2, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profile';
import { filesApi } from '../../api/files';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { getInitials } from '../../utils/formatters';

export const Profile = () => {
  const { user, profile, updateProfileState, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      setIsLoading(false);
    };
    loadData();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await profileApi.updateMine(formData);
      if (res.success) {
        updateProfileState(res.data);
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Échec de la mise à jour du profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await profileApi.uploadAvatar(file);
      if (res.success) {
        updateProfileState({ avatarUrl: res.data.avatarUrl });
        setMessage({ type: 'success', text: 'Photo de profil mise à jour.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Échec du téléchargement de la photo.' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (isLoading) {
    return <Loader text="Chargement du profil..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mon Profil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez vos informations personnelles et professionnelles.
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Photo & Basic Info */}
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-4">
            <div className="relative inline-block mx-auto group">
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-tt-blue to-tt-cyan text-white text-3xl font-bold flex items-center justify-center shadow-soft overflow-hidden border-4 border-white mx-auto">
                {profile?.avatarUrl ? (
                  <img
                    src={filesApi.getAvatarUrl(profile.avatarUrl)}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(profile?.fullName || user?.email)
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-tt-blue cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile?.fullName || 'Non défini'}</h2>
              <p className="text-xs text-slate-500 font-medium break-all">{user?.email}</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nom complet"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  iconLeft={User}
                  required
                />
                <Input
                  label="Titre professionnel"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="ex. Ingénieur Réseau"
                  iconLeft={Briefcase}
                />
                <Input
                  label="Numéro de téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  iconLeft={Phone}
                />
                <Input
                  label="Localisation"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="ex. Tunis, Tunisie"
                  iconLeft={MapPin}
                />
              </div>

              <Textarea
                label="À propos de moi"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Présentez-vous brièvement..."
                rows={4}
              />

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" variant="gradient" isLoading={isSaving} iconLeft={Save}>
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
