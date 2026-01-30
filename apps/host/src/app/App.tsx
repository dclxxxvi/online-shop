import React, { Suspense, lazy, useMemo } from 'react';
import { RouterProvider } from './providers/RouterProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Spinner } from '@shop-builder/shared';

// Lazy load storefront for subdomain access
const StorefrontApp = lazy(() => import('storefront/App'));

// Extract subdomain from hostname
// Supports: myshop.localhost, myshop.localhost:3000, myshop.127.0.0.1.nip.io
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;

  // Skip if it's just localhost or 127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // Handle *.localhost (e.g., myshop.localhost)
  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '');
    return subdomain || null;
  }

  // Handle *.nip.io for local testing (e.g., myshop.127.0.0.1.nip.io)
  const nipMatch = hostname.match(/^([^.]+)\.127\.0\.0\.1\.nip\.io$/);
  if (nipMatch) {
    return nipMatch[1];
  }

  // Handle production domains (e.g., myshop.shopbuilder.com)
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
);

export const App: React.FC = () => {
  const subdomain = useMemo(() => getSubdomain(), []);

  // If subdomain detected, render storefront directly
  if (subdomain) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <StorefrontApp subdomain={subdomain} />
      </Suspense>
    );
  }

  // Otherwise render the main admin app
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider />
      </Suspense>
    </AuthProvider>
  );
};