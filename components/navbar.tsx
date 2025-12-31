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

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract current locale from pathname or use default
  const currentLocale = pathname.split('/')[1];
  const locale = i18n.locales.includes(currentLocale as any) ? currentLocale : i18n.defaultLocale;
  
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href={homeLink} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/tynys-logo.png" 
                alt="Tynys Logo" 
                width={40} 
                height={40}
                className="drop-shadow-md"
                priority
              />
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                TynysAi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <DarkModeToggle />
            
            {/* Login/Signup Buttons - Show when not authenticated */}
            {status === 'unauthenticated' && (
              <div className="flex items-center gap-2 ml-2">
                <Link href={`/${locale}/sign-in`}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href={`/${locale}/sign-up`}>
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* User Profile Dropdown - Only show when authenticated */}
            {status === 'authenticated' && session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ml-2">
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarImage 
                        src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name || session.user.email}`} 
                        alt={session.user.name || 'User avatar'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {session.user.name ? getUserInitials(session.user.name) : session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                    <span>Sign Out</span>
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
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-6">
                  {/* User Profile Section - Show when authenticated */}
                  {status === 'authenticated' && session?.user && (
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
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href={`/${locale}/sign-up`} onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Settings Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Language</span>
                      <LanguageSwitcher />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <DarkModeToggle />
                    </div>
                  </div>

                  {/* Sign Out Button - Show when authenticated */}
                  {status === 'authenticated' && (
                    <Button 
                      variant="destructive" 
                      className="w-full mt-4"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
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

