'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  retry?: () => void;
}

export function ErrorState({ message, retry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">Terjadi Kesalahan</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-rose-700">
        {message}
      </p>
      {retry ? (
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800"
          onClick={retry}
        >
          Coba Lagi
        </Button>
      ) : null}
    </div>
  );
}
