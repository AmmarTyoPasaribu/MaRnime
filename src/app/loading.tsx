import { LogoMark } from '@/components/ui/Logo';

export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="relative">
        <span className="absolute inset-0 animate-ping bg-pop-yellow" />
        <LogoMark className="relative h-14 w-14 animate-pulse" />
      </div>
    </div>
  );
}
