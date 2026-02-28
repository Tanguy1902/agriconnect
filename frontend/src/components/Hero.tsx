import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheckCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Landing.Hero');

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-primary/5 to-transparent pt-24 pb-32 lg:pt-40 lg:pb-48">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] opacity-40 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              {t('badge')}
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {t.rich('title', {
                avenir: (chunks) => <><br /><span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-green-600">{chunks}</span></>
              })}
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t.rich('subtitle', {
                bold: (chunks) => <span className="block mt-2 text-primary font-bold">{chunks}</span>
              })}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
              <Link 
                href="/register"
                className="group relative px-10 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1.5 flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {t('ctaStart')}
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/about"
                className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-1.5 flex items-center justify-center backdrop-blur-sm"
              >
                {t('ctaDiscover')}
              </Link>
            </div>

            <div className="pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-5 text-base font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <span>{t('verified')}</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <span>{t('community')}</span>
              </div>
            </div>
          </div>
          
          {/* Visual Content */}
          <div className="flex-1 relative w-full max-w-2xl lg:max-w-none">
            <div className="relative aspect-square lg:aspect-4/3 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border-[12px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
               <Image
                 src="/images/hero-bg.png"
                 alt="Agriculture Madagascar"
                 fill
                 className="object-cover transition-transform duration-700 group-hover:scale-105"
                 priority
               />
               
               <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

               {/* Floating Cards */}
               <div className="absolute -bottom-8 -left-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 animate-bounce-slow hidden sm:block">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
                     <FontAwesomeIcon icon={faCheckCircle} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('opportunity')}</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white">{t('matchFound')}</p>
                   </div>
                 </div>
               </div>

               <div className="absolute top-12 -right-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 animate-bounce-slow delay-1000 hidden sm:block">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                     <FontAwesomeIcon icon={faUsers} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('network')}</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white">{t('directSimple')}</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
