"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faExclamationTriangle, faEye } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { parseBackendDate } from '@/utils/dateUtils';

interface DirectPurchase {
  id: number;
  offer_id: number;
  quantity: number;
  unit_price: number;
  message: string;
  status: string;
  created_at: string;
  offer: {
    product: {
      name: string;
      unit: string;
    };
    quantity: number;
    unit_price: number;
    farmer: {
      id: number;
      full_name: string;
      email: string;
      region: string;
    };
  };
}

export default function SentPurchasesPage() {
  const t = useTranslations('SentPurchases');
  const tMatches = useTranslations('Matches');
  const router = useRouter();
  const [purchases, setPurchases] = useState<DirectPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { showToast } = useToast();

  const fetchPurchases = useCallback(async () => {
    try {
      const response = await api.get('/direct-purchases/sent');
      setPurchases(response.data);
    } catch (err) {
      console.error('Failed to fetch purchases', err);
      showToast(t('loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = filter === 'all' 
    ? purchases
    : purchases.filter(p => p.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">{t('status.pending')}</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">{t('status.accepted')}</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">{t('status.rejected')}</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{t('status.cancelled')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  // date-fns doesn't have Malagasy locale, use French as fallback
  const getDateLocale = () => fr;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FontAwesomeIcon icon={faShoppingCart} className="text-primary" />
            {t('title')}
          </h1>
          <p className="text-foreground/60 mt-2">
            {t('subtitle')}
          </p>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterAll', { count: purchases.length })}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterPending', { count: purchases.filter(p => p.status === 'pending').length })}
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterAccepted', { count: purchases.filter(p => p.status === 'accepted').length })}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-foreground/40 mb-4" />
            <p className="text-foreground/60 mb-4">
              {filter === 'all' ? t('noPurchases') : 
               filter === 'pending' ? t('noPurchasesPending') : 
               filter === 'accepted' ? t('noPurchasesAccepted') : t('noPurchasesRejected')}
            </p>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FontAwesomeIcon icon={faEye} />
              {t('browseOffers')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => {
              // Safety check for missing data
              if (!purchase.offer || !purchase.offer.product) {
                return null;
              }
              
              return (
              <div
                key={purchase.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {purchase.offer.product.name}
                    </h3>
                    <p className="text-sm text-foreground/60">
                      {t('farmer', { name: purchase.offer.farmer?.full_name || 'Inconnu' })}
                    </p>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('yourOffer')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('offerDetails', { 
                        quantity: purchase.quantity, 
                        unit: purchase.offer.product.unit, 
                        price: purchase.unit_price.toLocaleString() 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('farmerPrice')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('priceDetails', { 
                        price: purchase.offer.unit_price.toLocaleString(), 
                        unit: purchase.offer.product.unit 
                      })}
                    </p>
                  </div>
                </div>

                {purchase.message && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-1">{t('yourMessage')}</p>
                    <p className="text-sm text-foreground italic">&quot;{purchase.message}&quot;</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-foreground/60">
                      {formatDistanceToNow(parseBackendDate(purchase.created_at), { addSuffix: true, locale: getDateLocale() })}
                    </p>
                    {purchase.status === 'accepted' && purchase.offer.farmer?.email && (
                      <p className="text-xs text-foreground/60 mt-1">
                        {t('contact', { email: purchase.offer.farmer.email })}
                      </p>
                    )}
                  </div>
                  {purchase.status === 'accepted' && purchase.offer.farmer?.id && (
                    <button
                      onClick={() => router.push(`/dashboard/chat?user_id=${purchase.offer.farmer.id}`)}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-comments"></i>
                      {tMatches('openDiscussion')}
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
