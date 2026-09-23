import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui/Loader';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Vérification de l'authentification..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If role does not match, redirect to the appropriate home dashboard
    if (user?.role === 'jobseeker') {
      return <Navigate to="/candidate/dashboard" replace />;
    } else {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'jobseeker') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return children;
};
