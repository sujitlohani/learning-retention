'use client';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { HomeDashboard } from '@/src/features/dashboard/components/HomeDashboard';
import { LandingPage } from '@/src/features/landing/components/LandingPage';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <HomeDashboard />;
}
