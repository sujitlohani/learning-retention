'use client';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { LandingPage } from '@/src/features/landing/components/LandingPage';
import { ClassroomPage } from '@/src/features/classroom';

export default function ClassroomRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <ClassroomPage />;
}