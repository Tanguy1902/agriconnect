"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlus, faTrash, faExclamationTriangle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { Link } from '@/i18n/routing';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { parseBackendDate } from '@/utils/dateUtils';

interface Demand {
  id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  max_unit_price: number;
  desired_delivery_date?: string;
  requirements?: string;
  status: string;
  created_at: string;
  product?: {
    name: string;
    unit: string;
  };
}

export default function CollectorDemandsPage() {
  const t = useTranslations('CollectorDemands');
  const c = useTranslations('Common');
  const m = useTranslations('Marketplace'); // Add marketplace translations
  const locale = useLocale();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const dateLocale = fr; // date-fns doesn't have Malagasy, use French

  const fetchDemands = useCallback(async () => {
    try {
      const response = await api.get('/demands/me');
      setDemands(response.data);
    } catch (err) {
      console.error('Failed to fetch demands', err);
      showToast(t('loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  const deleteDemand = async (demandId: number) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      await api.delete(`/demands/${demandId}`);
      setDemands(prev => prev.filter(d => d.id !== demandId));
      showToast(t('deleteSuccess'), 'success');
    } catch (err) {
      console.error('Failed to delete demand', err);
      showToast(t('deleteError'), 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">{t('status.active')}</span>;
      case 'fulfilled':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">{t('status.fulfilled')}</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{t('status.expired')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const getProductName = (demand: Demand) => {
    if (demand.product) return demand.product.name;
    if (demand.product_name) return demand.product_name;
    return t('unknownProduct');
  };

  const getProductUnit = (demand: Demand) => {
    if (demand.product) return demand.product.unit;
    return t('unit');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FontAwesomeIcon icon={faList} className="text-primary" />
              {t('title')}
            </h1>
            <p className="text-foreground/60 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/dashboard/collecteur/demandes/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t('newDemand')}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : demands.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-foreground/40 mb-4" />
            <p className="text-foreground/60 mb-4">
              {t('noDemands')}
            </p>
            <Link
              href="/dashboard/collecteur/demandes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('createFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {demands.map((demand) => (
              <div
                key={demand.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{getProductName(demand)}</h3>
                    <p className="text-sm text-foreground/60 mt-1">
                      {formatDistanceToNow(parseBackendDate(demand.created_at), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                  {getStatusBadge(demand.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-1">{m('quantity')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {demand.quantity} {getProductUnit(demand)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-1">{t('maxPrice')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {demand.max_unit_price?.toLocaleString() || 'N/A'} Ar
                    </p>
                  </div>
                  {demand.desired_delivery_date && (
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-foreground/60 mb-1">{t('deliveryDate')}</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(demand.desired_delivery_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')}
                      </p>
                    </div>
                  )}
                </div>

                {demand.requirements && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-1">{t('requirements')}</p>
                    <p className="text-sm text-foreground italic">&quot;{demand.requirements}&quot;</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <Link
                    href={`/demandes/${demand.id}`}
                    className="flex-1 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {m('details')}
                  </Link>
                  <Link
                    href={`/dashboard/collecteur/demandes/${demand.id}/edit`}
                    className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    {c('edit')}
                  </Link>
                  <button
                    onClick={() => deleteDemand(demand.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
                    title={c('delete')}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
