"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faArrowRight, faLeaf } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const t = useTranslations('Auth.login');
  const c = useTranslations('Common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token } = response.data;
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      
      login(access_token, {
        id: payload.user_id,
        email: payload.sub,
        full_name: payload.sub,
        user_type: payload.user_type
      });

    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error(error);
      setError(error.response?.data?.detail || c('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950">
      {/* Left side: Branding & Visual (Agricultural landscape) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 z-10 bg-linear-to-r from-black/60 via-black/20 to-transparent"></div>
        <Image
          src="/images/login-bg.png"
          alt="Agricultural Landscapes of Madagascar"
          fill
          className="object-cover animate-slow-zoom"
          priority
        />
        
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <div className="mb-8">
             <div className="flex items-center gap-3 mb-6">
                <Link href="/" className="inline-block bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                   <Image 
                     src="/images/logo.png" 
                     alt="AgriConnect" 
                     width={180} 
                     height={45} 
                     className="h-10 w-auto object-contain"
                   />
                </Link>
             </div>
             <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
               Connecter nos tantsaha <br />
               <span className="text-primary-light">au futur.</span>
             </h1>
             <p className="text-xl text-white/80 max-w-lg leading-relaxed font-light">
               La plateforme de référence pour valoriser l&apos;excellence agricole à Madagascar et simplifier les échanges commerciaux.
             </p>
          </div>
          
          <div className="flex gap-12 mt-8 py-8 border-t border-white/10">
             <div>
               <p className="text-3xl font-black">2000+</p>
               <p className="text-white/60 text-sm uppercase tracking-widest font-bold">Agriculteurs</p>
             </div>
             <div>
               <p className="text-3xl font-black">500+</p>
               <p className="text-white/60 text-sm uppercase tracking-widest font-bold">Collecteurs</p>
             </div>
             <div>
               <p className="text-3xl font-black">22</p>
               <p className="text-white/60 text-sm uppercase tracking-widest font-bold">Régions</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-12 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-8">
               <Link href="/" className="inline-block bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl shadow-xl">
                  <Image 
                    src="/images/logo.png" 
                    alt="AgriConnect" 
                    width={160} 
                    height={40} 
                    className="h-10 w-auto object-contain"
                  />
               </Link>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:text-primary-dark underline-offset-4 hover:underline transition-all font-bold">
                {t('register')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="group relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700"
                  placeholder={t('email')}
                />
              </div>

              <div className="group relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-medium shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700"
                  placeholder={t('password')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-5 h-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-md group-hover:border-primary transition-colors overflow-hidden">
                  <input type="checkbox" className="peer absolute opacity-0 cursor-pointer" />
                  <div className="absolute inset-0 bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Resté connecté</span>
              </label>
              <Link href="#" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 hover:bg-primary-dark hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="relative z-10">{loading ? c('loading') : t('submit')}</span>
              {!loading && <FontAwesomeIcon icon={faArrowRight} className="text-sm group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-12">
            <div className="relative mb-8 text-center">
               <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800"></div>
               <span className="relative z-10 px-4 py-1 text-xs font-black tracking-widest uppercase bg-slate-50 dark:bg-slate-950 text-slate-400">Ou continuer avec</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
                  Google
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
