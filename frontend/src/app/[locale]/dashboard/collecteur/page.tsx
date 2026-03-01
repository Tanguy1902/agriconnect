"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import MatchesList from '@/components/dashboard/MatchesList';
import { parseBackendDate } from '@/utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faList, 
  faShoppingCart, 
  faMoneyBillWave, 
  faStore, 
  faPlus 
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

interface Demand {
  id: number;
  quantity: number;
  max_unit_price: number | null;
  product?: {
    name: string;
    unit: string;
  };
  product_name?: string;
  created_at: string;
}

export default function CollectorDashboard() {
  const t = useTranslations('CollectorDashboard');
  const { user } = useAuth();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [stats, setStats] = useState({
    active_demands_count: 0,
    new_offers_count: 0,
    monthly_expenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandsRes, statsRes] = await Promise.all([
          api.get('/demands/me'),
          api.get('/statistics/collector')
        ]);
        setDemands(demandsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeDemandsCount = stats.active_demands_count;
  const newOffersCount = stats.new_offers_count;
  const monthlyExpenses = stats.monthly_expenses;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('welcome', { name: user?.full_name || '' })}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/dashboard/collecteur/demandes/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all hover:-translate-y-1"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" /> 
              {t('publishDemand')}
            </Link>
            <Link 
              href="/dashboard/collecteur/marche"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1"
            >
              <FontAwesomeIcon icon={faStore} className="text-primary" /> 
              {t('market')}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: t('stats.activeDemands'), value: loading ? "..." : activeDemandsCount, color: 'text-primary', bg: 'bg-primary/10', icon: faList },
            { label: t('stats.newOffers'), value: newOffersCount, color: 'text-orange-600', bg: 'bg-orange-100/50', icon: faShoppingCart },
            { label: t('stats.monthlyExpenses'), value: `${monthlyExpenses.toLocaleString()} Ar`, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800', icon: faMoneyBillWave },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{stat.label}</h3>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <FontAwesomeIcon icon={stat.icon} className={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Matches Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('matches.title')}</h2>
              <Link href="/dashboard/collecteur/matches" className="text-sm font-bold text-primary hover:underline">{t('matches.viewAll')}</Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 shadow-sm border border-slate-100 dark:border-slate-800/50">
              <div className="max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                <MatchesList userType="collecteur" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('demands.title')}</h2>
              <Link href="/dashboard/collecteur/demandes" className="text-sm font-bold text-primary hover:underline">{t('demands.manage')}</Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden">
              <div className="p-8">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                  </div>
                ) : demands.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-200 dark:text-slate-800 mb-4">
                      <FontAwesomeIcon icon={faList} size="3x" />
                    </div>
                    <p className="text-slate-500 font-bold">{t('demands.noDemands')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {demands.slice(0, 4).map((demand) => (
                      <div key={demand.id} className="group flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FontAwesomeIcon icon={faList} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {demand.product?.name || demand.product_name || t('demands.unknownProduct')}
                            </p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                              {demand.quantity} {demand.product?.unit || ''} 
                              {demand.max_unit_price ? ` • ${t('demands.maxPrice', { price: demand.max_unit_price })}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                            {parseBackendDate(demand.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
