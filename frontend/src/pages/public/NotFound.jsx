import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-100 text-tt-blue flex items-center justify-center shadow-soft">
          <HelpCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Introuvable
          </h1>
          <p className="text-sm text-slate-500">
            La page que vous recherchez n'existe pas ou a été déplacée sur la plateforme Tunisie Telecom.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="gradient" iconLeft={Home}>
              Retour à l'accueil
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline">
              Voir les offres TT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
