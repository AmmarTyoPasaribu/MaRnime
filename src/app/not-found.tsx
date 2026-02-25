import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-6">
          <span className="text-[120px] sm:text-[180px] font-black leading-none gradient-text opacity-20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">😵</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
          The page you&#39;re looking for doesn&#39;t exist or has been moved. Maybe the anime you&#39;re searching for is in another dimension.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link href="/browse" className="btn-secondary">
            <Search className="w-4 h-4" />
            Browse Anime
          </Link>
        </div>
      </div>
    </div>
  );
}
