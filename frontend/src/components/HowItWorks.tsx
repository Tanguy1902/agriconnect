import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBullhorn, faHandshake, faCheckCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('Landing.HowItWorks');

  const steps = [
    {
      number: "01",
      key: "step1",
      icon: faUserPlus,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      number: "02",
      key: "step2",
      icon: faBullhorn,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      number: "03",
      key: "step3",
      icon: faCheckCircle,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      number: "04",
      key: "step4",
      icon: faHandshake,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-slate-900 dark:text-white tracking-tight">
            {t.rich('title', {
              marche: (chunks) => <span className="text-primary">{chunks}</span>
            })}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
            {t('subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="group relative bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                <div className={`w-20 h-20 rounded-3xl ${step.bg} ${step.color} flex items-center justify-center text-3xl mb-8 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                
                <div className="absolute top-8 right-8 text-slate-100 dark:text-slate-800 text-5xl font-black opacity-80 select-none group-hover:scale-110 transition-transform duration-500">
                  {step.number}
                </div>

                <h3 className="text-2xl font-black mb-4 text-center text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-center text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
                  {t(`${step.key}.description`)}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-20 text-primary/30 group-hover:translate-x-2 transition-transform duration-500">
                    <FontAwesomeIcon icon={faArrowRight} className="text-2xl" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
