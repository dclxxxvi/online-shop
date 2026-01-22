import React, { useEffect } from 'react';
import { useAuthStore } from '@entities/user/model/authStore';
import { apiClient } from '@shop-builder/shared';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize API client with stored tokens
    apiClient.loadTokensFromStorage();
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
};