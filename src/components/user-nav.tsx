'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { Check, Globe } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import { localeNames, locales } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('userMenu.changeLanguage')}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('userMenu.changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel>{t('userMenu.language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setLocale(option)}
            className="cursor-pointer"
          >
            <span className="flex-1">{localeNames[option]}</span>
            <Check
              className={cn(
                'ml-2 h-4 w-4',
                locale === option ? 'opacity-100' : 'opacity-0'
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function UserNav() {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" alt="@teacher" data-ai-hint="person portrait" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{t('userMenu.teacher')}</p>
              <p className="text-xs leading-none text-muted-foreground">
                teacher@school.edu
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              {t('userMenu.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t('userMenu.settings')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {t('userMenu.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
