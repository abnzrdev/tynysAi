'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { i18n, type Locale } from '@/lib/i18n/config';

const languageNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  kz: 'Қазақша',
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale;

  const switchLocale = (newLocale: string) => {
    if (!pathname) return;

    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    // Set cookie and navigate
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLocale} onValueChange={switchLocale}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {i18n.locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {languageNames[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Simplified version for mobile/header
export function LanguageSwitcherCompact() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split('/')[1] as Locale;

  const getNextLocale = () => {
    const currentIndex = i18n.locales.indexOf(currentLocale);
    const nextIndex = (currentIndex + 1) % i18n.locales.length;
    return i18n.locales[nextIndex];
  };

  const switchToNextLocale = () => {
    const newLocale = getNextLocale();
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={switchToNextLocale}
      className="flex items-center gap-2 hover:border-teal-600 dark:hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{languageNames[currentLocale]}</span>
    </Button>
  );
}

