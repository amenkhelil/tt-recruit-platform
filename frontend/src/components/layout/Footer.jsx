import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 relative overflow-hidden mt-auto">
      {/* Decorative gradient top accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-tt-blue via-tt-cyan to-purple-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-md">
                <img src="/tt-logo.svg" alt="TT" className="h-7 w-auto" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                TT RECRUIT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plateforme officielle de recrutement de Tunisie Telecom. Simplification du recrutement et mise en relation des meilleurs talents avec nos offres.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Plateforme certifiée Tunisie Telecom</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-cyan-400 transition-colors">
                  Consulter toutes les offres
                </Link>
              </li>
              <li>
                <Link to="/candidate/applications" className="hover:text-cyan-400 transition-colors">
                  Mon Espace Candidat
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">
                  Espace Candidat / Recruteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Telecom Divisions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Pôles & Métiers
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Réseaux & Télécommunications 5G/Fibre</li>
              <li>Développement Logiciel & MERN/DevOps</li>
              <li>Sécurité des Systèmes d'Information</li>
              <li>Intelligence Artificielle & Data Science</li>
              <li>Marketing & Relation Client Digitale</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact Tunisie Telecom
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Siège Social Tunisie Telecom, Rue Japon, Montplaisir, 1073 Tunis</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+216 71 000 000 / 1298</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">recrutement@tunisietelecom.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Tunisie Telecom — Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Développé avec excellence pour Tunisie Telecom
          </p>
        </div>
      </div>
    </footer>
  );
};
