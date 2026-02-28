"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const t = useTranslations('Common');
  const d = useTranslations('Dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left side: Logo & Desktop Nav */}
        <div className="flex items-center gap-8 lg:gap-12 flex-1">
          <Link href="/" className="hover:opacity-90 transition-opacity shrink-0 flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="AgriConnect" 
              width={160} 
              height={40} 
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/demandes" className="text-xs xl:text-sm font-bold text-foreground/60 hover:text-primary transition-colors relative group whitespace-nowrap">
              {d('myDemands')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/products" className="text-xs xl:text-sm font-bold text-foreground/60 hover:text-primary transition-colors relative group whitespace-nowrap">
              {t('products')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/offers" className="text-xs xl:text-sm font-bold text-foreground/60 hover:text-primary transition-colors relative group whitespace-nowrap">
              {t('offers')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </nav>
        </div>

        {/* Right side: Language & Profile/Login */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={user.user_type === 'agriculteur' ? '/dashboard/agriculteur' : '/dashboard/collecteur'} className="px-4 py-2 text-xs xl:text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
                {t('dashboard')}
              </Link>
              <Link href="/profile" className="px-4 py-2 text-xs xl:text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 text-center">
                {t('profile')}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-xs xl:text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
                {t('login')}
              </Link>
              <Link href="/register" className="px-4 py-2 text-xs xl:text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 text-center">
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-xl" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden glass-effect border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300 absolute top-16 left-0 right-0 shadow-2xl">
          <div className="flex flex-col p-6 gap-2">
            <Link href="/demandes" className="py-3 px-4 rounded-xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>
              {d('myDemands')}
            </Link>
            <Link href="/products" className="py-3 px-4 rounded-xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>
              {t('products')}
            </Link>
            <Link href="/offers" className="py-3 px-4 rounded-xl text-foreground/80 hover:bg-primary/5 hover:text-primary font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>
              {t('offers')}
            </Link>
            
            <hr className="my-3 border-slate-100 dark:border-slate-800" />
            
            {user ? (
              <div className="flex flex-col gap-2">
                <Link href={user.user_type === 'agriculteur' ? '/dashboard/agriculteur' : '/dashboard/collecteur'} className="py-3 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all text-center" onClick={() => setIsMenuOpen(false)}>
                  {t('dashboard')}
                </Link>
                <Link href="/profile" className="py-3 px-4 rounded-xl bg-primary text-white font-bold text-center shadow-lg shadow-primary/20" onClick={() => setIsMenuOpen(false)}>
                  {t('profile')}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="py-3 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all text-center" onClick={() => setIsMenuOpen(false)}>
                  {t('login')}
                </Link>
                <Link href="/register" className="py-3 px-4 rounded-xl bg-primary text-white font-bold text-center shadow-lg shadow-primary/20" onClick={() => setIsMenuOpen(false)}>
                  {t('register')}
                </Link>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
               <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
