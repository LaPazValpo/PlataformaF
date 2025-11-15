'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Lock, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import logo from '@/logo.png';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contacto', label: 'Contacto' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  const isIntranet = pathname.startsWith('/intranet');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isIntranet) {
    return null;
  }
  
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300',
        isScrolled ? 'h-20' : 'h-28'
      )}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col space-y-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-lg text-muted-foreground hover:text-primary',
                      pathname === href && 'text-primary font-semibold'
                    )}
                  >
                    {label}
                  </Link>
                ))}
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='text-lg text-muted-foreground hover:text-primary flex items-center'
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Intranet
                  </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation Left */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navLinks.map((item, index) => {
            if (index > 1) return null; // Only show Inicio and Blog
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                  pathname === item.href && 'text-primary'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Centered Logo */}
         <Link href="/">
              <Image
                  src={logo}
                  alt="Paz Final Logo"
                  width={245}
                  height={81}
                  className="object-contain"
                  priority
                />
        </Link>

        {/* Desktop Navigation Right */}
        <nav className="hidden items-center space-x-6 md:flex">
           <Link
              href="/#contacto"
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                pathname === "/#contacto" && 'text-primary'
              )}
            >
              Contacto
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">
                <Lock className="mr-2 h-4 w-4" /> Intranet
              </Link>
            </Button>
        </nav>

        {/* This div is for mobile layout to balance the menu button */}
        <div className="w-10 md:hidden" />
      </div>
    </header>
  );
};

export default Header;
