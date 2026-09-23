import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profile';
import { setAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileApi.getMine();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch {
      // If profile fetch fails (e.g. not created yet or network issue), keep profile as null
    }
  }, []);

  // Restore session on initial load via refresh token cookie
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const res = await authApi.refresh();
        if (res.success && res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
          if (isMounted) {
            setUser(res.data.user);
          }
          // Also fetch full user profile
          try {
            const profileRes = await profileApi.getMine();
            if (isMounted && profileRes.success && profileRes.data) {
              setProfile(profileRes.data);
            }
          } catch {
            // Profile fetch optional on boot
          }
        }
      } catch {
        // No active session or cookie expired
        setAccessToken(null);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      await fetchProfile();
      return res.data.user;
    }
    throw new Error(res.message || 'Échec de connexion');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    return res.data; // { userId, email, role }
  };

  const verifyEmail = async (userId, code) => {
    const res = await authApi.verifyEmail({ userId, code });
    if (res.success) {
      // update user verification state if logged in
      setUser((prev) => (prev ? { ...prev, isEmailVerified: true } : prev));
    }
    return res.data;
  };

  const resendOtp = async (userId) => {
    const res = await authApi.resendOtp({ userId });
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfileState = (updatedData) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role || null,
    isJobseeker: user?.role === 'jobseeker',
    isRecruiter: user?.role === 'recruiter' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    login,
    register,
    verifyEmail,
    resendOtp,
    logout,
    fetchProfile,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
