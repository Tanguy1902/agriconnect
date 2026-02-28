import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake, faChartLine, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Features() {
  const t = useTranslations('Landing.Features');

  const features = [
    {
      key: "feature1",
      icon: faHandshake,
      color: "bg-blue-500",
    },
    {
      key: "feature2",
      icon: faChartLine,
      color: "bg-emerald-500",
    },
    {
      key: "feature3",
      icon: faMobileAlt,
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-white dark:from-slate-950 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            {t.rich('title', {
              brand: (chunks) => <span className="text-primary">{chunks}</span>
            })}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-10 rounded-[2.5rem] bg-white dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:-translate-y-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50"
            >
              <div className={`w-20 h-20 rounded-3xl ${feature.color} bg-opacity-10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                <FontAwesomeIcon icon={feature.icon} className={`text-${feature.color.replace('bg-', '')}`} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {t(`${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
