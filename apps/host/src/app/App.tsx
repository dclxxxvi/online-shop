import React, { Suspense } from 'react';
import { RouterProvider } from './providers/RouterProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Spinner } from '@shop-builder/shared';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Spinner size="lg" />
          </div>
        }
      >
        <RouterProvider />
      </Suspense>
    </AuthProvider>
  );
};