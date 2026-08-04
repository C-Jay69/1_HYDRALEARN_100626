import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
       <Image 
        src="/logo.svg"
        alt="HydraLearn Logo"
        width={36}
        height={36}
       />
      <h1 className="font-headline text-lg font-bold text-sidebar-foreground">
        HydraLearn
      </h1>
    </div>
  );
}
