import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/logo.png" 
                alt="AgriConnect" 
                width={140} 
                height={35} 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-foreground/60">
              {t('description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('platform')}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/offers" className="hover:text-primary">{t('offers')}</Link></li>
              <li><Link href="/demandes" className="hover:text-primary">{t('demands')}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">{t('pricing')}</Link></li>
            </ul>
          </div>
 
          <div>
            <h4 className="font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><Link href="/help" className="hover:text-primary">{t('helpCenter')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary">{t('contact')}</Link></li>
              <li><Link href="/terms" className="hover:text-primary">{t('terms')}</Link></li>
            </ul>
          </div>
 
          <div>
            <h4 className="font-semibold mb-4">{t('newsletter')}</h4>
            <p className="text-sm text-foreground/60 mb-4">
              {t('newsletterDesc')}
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 text-center text-sm text-foreground/40">
          © {new Date().getFullYear()} AgriConnect. {t('rights')}
        </div>
      </div>
    </footer>
  );
}
