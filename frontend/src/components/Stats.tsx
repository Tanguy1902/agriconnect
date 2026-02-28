import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faExchangeAlt, faCoins, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Stats() {
  const t = useTranslations('Stats');
  
  const stats = [
    { label: t('farmers'), value: "1,200+", icon: faUsers, color: "text-blue-400" },
    { label: t('products'), value: "5,000T", icon: faExchangeAlt, color: "text-green-400" },
    { label: t('volume'), value: "2.5M Ar", icon: faCoins, color: "text-yellow-400" },
    { label: t('regions'), value: "12", icon: faMapMarkedAlt, color: "text-purple-400" },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group p-6 rounded-2xl hover:bg-white/5 transition-colors">
              <div className={`text-4xl mb-4 ${stat.color} transform group-hover:scale-110 transition-transform duration-300`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className="text-4xl lg:text-5xl font-bold mb-2 tracking-tight">{stat.value}</div>
              <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
