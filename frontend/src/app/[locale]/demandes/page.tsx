"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

interface Demand {
  id: number;
  product_name: string;
  quantity: number;
  max_unit_price: number;
  desired_delivery_date: string;
  quality_required: string;
  special_requirements: string;
  created_at: string;
  product?: {
    name: string;
    unit: string;
    category: string;
  };
  collector?: {
    full_name: string;
    region: string;
  };
}

export default function PublicDemandsPage() {
  const t = useTranslations('Demands');
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const response = await api.get('/demands/');
        setDemands(response.data);
      } catch (err) {
        console.error("Failed to fetch demands", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemands();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{t('title')}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : demands.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="text-slate-300 dark:text-slate-700 mb-4">
              <FontAwesomeIcon icon={faLeaf} size="3x" />
            </div>
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">{t('noDemands')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demands.map((demande) => (
              <div key={demande.id} className="group bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-slate-100 dark:border-slate-800/50 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold group-hover:scale-110 transition-transform duration-500">
                      <FontAwesomeIcon icon={faLeaf} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                        {demande.product?.name || demande.product_name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {demande.product?.category || "Agriculture"}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-100 dark:border-emerald-800/30">
                    {t('open')}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{t('quantity')}</p>
                      <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                        {demande.quantity} {demande.product?.unit || 'unités'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{t('maxPrice')}</p>
                      <p className="text-sm font-extrabold text-primary">
                        {demande.max_unit_price ? `${demande.max_unit_price} Ar` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-primary shadow-sm border border-slate-100 dark:border-slate-600">
                      <FontAwesomeIcon icon={faLeaf} size="sm" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('collector')}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{demande.collector?.full_name || t('anonymous')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  {!isLoading && user?.user_type === 'agriculteur' && (
                    <Link 
                      href={`/dashboard/agriculteur/offres/new?demand_id=${demande.id}`}
                      className="w-full py-4 px-6 bg-primary text-white rounded-2xl text-center text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t('proposeProducts')}
                    </Link>
                  )}
                  {!isLoading && !isAuthenticated && (
                    <Link 
                      href="/login"
                      className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-center text-sm font-bold hover:opacity-90 transition-all duration-300"
                    >
                      {t('loginToPropose')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
