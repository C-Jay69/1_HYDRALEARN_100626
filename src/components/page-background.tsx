'use client';

import { usePathname } from 'next/navigation';

/**
 * Route-to-image map for the app's page backgrounds.
 * Images live in /public. Nested routes fall back to the closest parent route.
 */
const pageBackgrounds: Record<string, string> = {
  '/dashboard': '/pexels-luyi-11563212.jpg',
  '/lesson-planner': '/pexels-this-and-no-internet-25-288559-20670596.jpg',
  '/assessment-generator': '/pexels-max-fischer-5212363.jpg',
  '/batch-essay-grader': '/pexels-this-and-no-internet-25-288559-20670596.jpg',
  '/essay-grader': '/pexels-this-and-no-internet-25-288559-20670596.jpg',
  '/personalization': '/pexels-luyi-11563212.jpg',
  '/gamification': '/pexels-yankrukov-9071740.jpg',
  '/gamification/definition-derby': '/pexels-yankrukov-9071740.jpg',
  '/differentiated-activities': '/pexels-brian-t-2150183658-31003855.jpg',
  '/schedule': '/pexels-thirdman-8926848.jpg',
  '/studio': '/pexels-max-fischer-5212363.jpg',
  '/protect/forum': '/pexels-ivan-s-8962875.jpg',
  '/protect/hydra-ear': '/pexels-ivan-s-8962875.jpg',
  '/protect/safety-board': '/pexels-rdne-8500353.jpg',
  '/protect/wellness': '/pexels-thirdman-8926848.jpg',
  '/user-guide': '/pexels-rdne-8500353.jpg',
};

function resolveBackground(pathname: string): string | undefined {
  if (pageBackgrounds[pathname]) {
    return pageBackgrounds[pathname];
  }

  const nested = Object.keys(pageBackgrounds)
    .filter((route) => pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return nested ? pageBackgrounds[nested] : undefined;
}

export function PageBackground() {
  const pathname = usePathname();
  const image = resolveBackground(pathname);

  if (!image) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-background/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background/75" />
    </div>
  );
}
