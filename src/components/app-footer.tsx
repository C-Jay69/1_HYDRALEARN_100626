import Image from 'next/image';
import Link from 'next/link';
import { Github, Twitter, BookOpen } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-background py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex w-max items-center justify-center rounded-lg bg-white px-2 py-1 shadow-sm">
              <Image
                src="/logo.png"
                alt="HydraLearn"
                width={1366}
                height={768}
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground pt-1">
              Many heads. One goal: smarter, safer learning.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex gap-4">
              <Link
                href="/user-guide"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                User Guide
              </Link>
            </div>

            <div className="flex gap-4">
              <Link
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://docs.example.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Documentation"
              >
                <BookOpen className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} HydraLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
