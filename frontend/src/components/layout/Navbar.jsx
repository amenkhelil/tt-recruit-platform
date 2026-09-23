import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  User,
  LogOut,
  PlusCircle,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getInitials } from '../../utils/formatters';
import { filesApi } from '../../api/files';

export const Navbar = () => {
  const { user, profile, isAuthenticated, isJobseeker, isRecruiter, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/tt-logo.png" alt="Tunisie Telecom" className="h-10 w-auto" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/')
                    ? 'text-tt-blue bg-blue-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Accueil
              </Link>
              <Link
                to="/jobs"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/jobs')
                    ? 'text-tt-blue bg-blue-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Offres d'emploi
              </Link>

              {/* Role specific quick links */}
              {isJobseeker && (
                <>
                  <Link
                    to="/candidate/applications"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${location.pathname.startsWith('/candidate')
                        ? 'text-tt-blue bg-blue-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Mon Espace
                  </Link>
                  <Link
                    to="/candidate/resumes"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/candidate/resumes')
                        ? 'text-tt-blue bg-blue-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Mon CV
                  </Link>
                </>
              )}

              {isRecruiter && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${location.pathname.startsWith('/recruiter')
                        ? 'text-tt-blue bg-blue-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Espace Recruteur
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/recruiter/jobs')
                        ? 'text-tt-blue bg-blue-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    Gérer les Offres
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Desktop Right Side CTA / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isRecruiter && (
              <Link to="/recruiter/jobs/create">
                <Button size="sm" variant="gradient" iconLeft={PlusCircle}>
                  Publier une offre
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-tt-blue/40 bg-white hover:bg-slate-50/80 transition-all focus:outline-none"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[130px]">
                      {profile?.fullName || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-tt-blue font-semibold uppercase tracking-wider">
                      {user?.role === 'jobseeker' ? 'Candidat' : 'Recruteur TT'}
                    </span>
                  </div>

                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-tt-blue to-tt-cyan text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden border border-white">
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
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-card border border-slate-100 z-20 animate-scaleUp">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-semibold text-slate-400">Connecté en tant que</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                      </div>

                      {isJobseeker && (
                        <>
                          <Link
                            to="/candidate/applications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Mes Candidatures</span>
                          </Link>
                          <Link
                            to="/candidate/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Mon Profil</span>
                          </Link>
                          <Link
                            to="/candidate/resumes"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>Mon CV</span>
                          </Link>
                        </>
                      )}

                      {isRecruiter && (
                        <>
                          <Link
                            to="/recruiter/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Dashboard Recruteur</span>
                          </Link>
                          <Link
                            to="/recruiter/jobs"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Gérer les offres TT</span>
                          </Link>
                          <Link
                            to="/candidate/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Mon Profil</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Accueil
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Offres d'emploi
            </Link>

            {isAuthenticated ? (
              <>
                {isJobseeker && (
                  <>
                    <Link
                      to="/candidate/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mes Candidatures
                    </Link>
                    <Link
                      to="/candidate/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mon Profil
                    </Link>
                    <Link
                      to="/candidate/resumes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mon CV
                    </Link>
                  </>
                )}

                {isRecruiter && (
                  <>
                    <Link
                      to="/recruiter/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard Recruteur
                    </Link>
                    <Link
                      to="/recruiter/jobs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Gérer les offres TT
                    </Link>
                    <Link
                      to="/recruiter/jobs/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm font-semibold text-tt-blue hover:bg-blue-50"
                    >
                      + Publier une offre
                    </Link>
                  </>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
