'use client';

import { ErrorState } from '@/components/dashboard/ErrorState';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <ErrorState
      message={error.message || 'Dashboard belum bisa dimuat. Silakan coba lagi.'}
      retry={reset}
    />
  );
}
