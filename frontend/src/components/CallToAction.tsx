import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function CallToAction() {
  const t = useTranslations('Landing.CTA');

  return (
    <section className="py-32 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="relative bg-slate-900 dark:bg-slate-900 rounded-[3.5rem] p-12 md:p-24 text-center md:text-left overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
            <div className="max-w-2xl space-y-10">
              <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                {t.rich('title', {
                  bold: (chunks) => <><br/><span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">{chunks}</span></>
                })}
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-xl font-medium">
                {t('description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link 
                  href="/register"
                  className="group relative px-10 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {t('register')}
                  <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link 
                  href="/contact"
                  className="px-10 py-5 bg-white/10 text-white border-2 border-white/10 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-4"
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('contact')}
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block relative w-2/5">
              <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden border-8 border-white/10 shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-700 group">
                <Image
                  src="/images/cta-farmer.png"
                  alt="Agriculteur heureux"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
