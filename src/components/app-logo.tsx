import Image from 'next/image';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Image
        src="/logo.png"
        alt="HydraLearn Logo"
        width={36}
        height={36}
        className="size-9 object-contain drop-shadow-[0_2px_8px_rgba(139,92,246,0.4)]"
      />
      <h1 className="font-headline text-lg font-bold text-sidebar-foreground">
        Hydra<span className="gradient-text">Learn</span>
      </h1>
    </div>
  );
}