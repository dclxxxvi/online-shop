import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@entities/user/model/authStore';
import { Spinner } from '@shop-builder/shared';

const DashboardPage = lazy(() => import('@pages/dashboard'));
const LoginPage = lazy(() => import('@pages/login'));
const RegisterPage = lazy(() => import('@pages/register'));

// Lazy load remote apps
const EditorApp = lazy(() => import('editor/App'));
const StorefrontApp = lazy(() => import('storefront/App'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
);

export const RouterProvider: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Editor remote app */}
        <Route
          path="/editor/*"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <EditorApp />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Storefront remote app (for preview) */}
        <Route
          path="/preview/*"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <StorefrontApp />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};