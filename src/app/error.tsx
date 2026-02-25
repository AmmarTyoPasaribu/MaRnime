'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[var(--color-red)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          An error occurred while loading this page. This might be a temporary issue — try refreshing.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
