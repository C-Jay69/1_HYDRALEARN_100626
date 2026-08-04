import Image from 'next/image';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <div className="flex items-center justify-center rounded-lg bg-white px-2 py-1 shadow-sm">
        <Image
          src="/logo.png"
          alt="HydraLearn"
          width={1366}
          height={768}
          className="h-8 w-auto object-contain"
        />
      </div>
    </div>
  );
}