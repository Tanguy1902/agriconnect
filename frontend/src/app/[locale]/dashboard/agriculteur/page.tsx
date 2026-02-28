"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import api, { BASE_URL } from '@/lib/api';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import MatchesList from '@/components/dashboard/MatchesList';

interface Offer {
  id: number;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
    unit: string;
  };
  created_at: string;
  status: string;
  image_url?: string;
}

export default function FarmerDashboard() {
  const t = useTranslations('FarmerDashboard');
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState({
    active_offers_count: 0,
    active_orders_count: 0,
    monthly_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, statsRes] = await Promise.all([
          api.get('/offers/me'),
          api.get('/statistics/farmer')
        ]);
        setOffers(offersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeOffersCount = stats.active_offers_count;
  const activeOrdersCount = stats.active_orders_count; 
  const monthlyRevenue = stats.monthly_revenue;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('welcome', { name: user?.full_name })}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
          <Link 
            href="/dashboard/agriculteur/offres/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all hover:-translate-y-1"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" /> 
            {t('addProduct')}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: t('stats.activeOffers'), value: loading ? "..." : activeOffersCount, color: 'text-primary', bg: 'bg-primary/10' },
            { label: t('stats.activeOrders'), value: activeOrdersCount, color: 'text-amber-600', bg: 'bg-amber-100/50' },
            { label: t('stats.monthlyRevenue'), value: `${monthlyRevenue.toLocaleString()} Ar`, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{stat.label}</h3>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <FontAwesomeIcon icon={faBox} className={stat.color} />
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
              <Link href="/dashboard/agriculteur/matches" className="text-sm font-bold text-primary hover:underline">{t('matches.viewAll')}</Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 shadow-sm border border-slate-100 dark:border-slate-800/50">
              <MatchesList userType="agriculteur" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('products.title')}</h2>
              <Link href="/dashboard/agriculteur/offres" className="text-sm font-bold text-primary hover:underline">{t('products.manage')}</Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden">
              <div className="p-8">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-200 dark:text-slate-800 mb-4">
                      <FontAwesomeIcon icon={faBox} size="3x" />
                    </div>
                    <p className="text-slate-500 font-bold">{t('products.noProducts')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.slice(0, 4).map((offer) => (
                      <div key={offer.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden relative shadow-sm">
                            {offer.image_url ? (
                              <Image 
                                src={offer.image_url.startsWith('http') ? offer.image_url : `${BASE_URL}${offer.image_url}`} 
                                alt={offer.product.name} 
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                <FontAwesomeIcon icon={faBox} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{offer.product.name}</p>
                            <p className="text-xs font-bold text-primary">{offer.unit_price} Ar / {offer.product.unit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            offer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {offer.status === 'active' ? t('products.active') : offer.status}
                          </span>
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
