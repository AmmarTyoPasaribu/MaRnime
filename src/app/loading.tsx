import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-aurora-teal)] mx-auto mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  );
}
