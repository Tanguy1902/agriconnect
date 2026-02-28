"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
      {routing.locales.map((cur) => (
        <button
          key={cur}
          disabled={isPending}
          onClick={() => onSelectChange(cur)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            locale === cur
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/60 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          {cur.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
