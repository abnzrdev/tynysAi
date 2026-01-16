'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import DarkModeToggle from '@/components/dark-mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { i18n } from '@/lib/i18n/config';

// Client-side translations for navbar
type NavbarTranslations = {
  login: string;
  signUp: string;
  signOut: string;
  menu: string;
  language: string;
  theme: string;
};

const translations: Record<string, NavbarTranslations> = {
  en: {
    login: "Login",
    signUp: "Sign Up",
    signOut: "Sign Out",
    menu: "Menu",
    language: "Language",
    theme: "Theme"
  },
  ru: {
    login: "Вход",
    signUp: "Регистрация",
    signOut: "Выйти",
    menu: "Меню",
    language: "Язык",
    theme: "Тема"
  },
  kz: {
    login: "Кіру",
    signUp: "Тіркелу",
    signOut: "Шығу",
    menu: "Мәзір",
    language: "Тіл",
    theme: "Тақырып"
  }
};

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const isDashboardRoute = pathname?.includes('/dashboard');
  
  // Extract current locale from pathname or use default
  const currentLocale = pathname.split('/')[1];
  const locale = (i18n.locales as readonly string[]).includes(currentLocale) ? currentLocale : i18n.defaultLocale;
  
  // Get translations for current locale
  const t = translations[locale] || translations.en;
  
  // Determine home link based on whether we're in a localized route
  const homeLink = pathname.startsWith(`/${locale}`) ? `/${locale}` : '/';

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  const navBase = "sticky top-0 z-50 w-full bg-background dark:bg-background border-b border-border/60 shadow-sm";
  const showProfileActions = status === 'authenticated' && session?.user && isDashboardRoute;

  return (
    <nav className={navBase}>
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href={homeLink} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/tynys-logo.png" 
                alt="Tynys Logo" 
                width={52} 
                height={52}
                className="drop-shadow-md"
                priority
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                TynysAi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <DarkModeToggle />
            
            {/* Login/Signup Buttons - Show when not authenticated */}
            {status === 'unauthenticated' && (
              <div className="flex items-center gap-3 ml-3">
                <Link href={`/${locale}/sign-in`}>
                  <Button variant="ghost" size="default" className="text-lg h-11 px-5">
                    {t.login}
                  </Button>
                </Link>
                <Link href={`/${locale}/sign-up`}>
                  <Button size="default" className="text-lg h-11 px-5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                    {t.signUp}
                  </Button>
                </Link>
              </div>
            )}
            
            {/* User Profile Dropdown - Only show when authenticated */}
            {showProfileActions && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ml-2">
                    <Avatar className="h-11 w-11 border-2 border-primary">
                      <AvatarImage 
                        src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name || session.user.email}`} 
                        alt={session.user.name || 'User avatar'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-base">
                        {session.user.name ? getUserInitials(session.user.name) : session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-none">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.signOut}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu - Visible only on mobile */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">{t.menu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="z-50 w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">{t.menu}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-6">
                  {/* User Profile Section - Show when authenticated */}
                  {showProfileActions && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage 
                          src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name || session.user.email}`} 
                          alt={session.user.name || 'User avatar'}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {session.user.name ? getUserInitials(session.user.name) : session.user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Login/Signup Buttons - Show when not authenticated */}
                  {status === 'unauthenticated' && (
                    <div className="flex flex-col gap-3 pb-4 border-b border-border">
                      <Link href={`/${locale}/sign-in`} onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full text-lg h-11">
                          {t.login}
                        </Button>
                      </Link>
                      <Link href={`/${locale}/sign-up`} onClick={() => setIsOpen(false)}>
                        <Button className="w-full text-lg h-11 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                          {t.signUp}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Settings Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.language}</span>
                      <LanguageSwitcher />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.theme}</span>
                      <DarkModeToggle />
                    </div>
                  </div>

                  {/* Sign Out Button - Show when authenticated */}
                  {showProfileActions && (
                    <Button 
                      variant="destructive" 
                      className="w-full mt-4"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.signOut}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

