import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { Home } from '../pages/public/Home';
import { Jobs } from '../pages/public/Jobs';
import { JobDetail } from '../pages/public/JobDetail';
import { NotFound } from '../pages/public/NotFound';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Candidate Pages
import { Profile } from '../pages/candidate/Profile';
import { Resumes } from '../pages/candidate/Resumes';
import { Applications } from '../pages/candidate/Applications';
import { ApplicationDetail } from '../pages/candidate/ApplicationDetail';

// Recruiter Pages
import { RecruiterDashboard } from '../pages/recruiter/Dashboard';
import { ManageJobs } from '../pages/recruiter/ManageJobs';
import { CreateJob } from '../pages/recruiter/CreateJob';
import { EditJob } from '../pages/recruiter/EditJob';
import { JobApplicants } from '../pages/recruiter/JobApplicants';
import { ApplicationReview } from '../pages/recruiter/ApplicationReview';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Public only Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Candidate Dashboard Routes (Protected, jobseeker role) */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/candidate/applications" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="resumes" element={<Resumes />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
          </Route>

          {/* Recruiter Dashboard Routes (Protected, recruiter & admin role) */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/create" element={<CreateJob />} />
            <Route path="jobs/:id/edit" element={<EditJob />} />
            <Route path="jobs/:id/applicants" element={<JobApplicants />} />
            <Route path="applications/:id" element={<ApplicationReview />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
