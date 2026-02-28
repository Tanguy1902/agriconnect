"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faShoppingBag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  collector: {
    id: number;
    full_name: string;
    email: string;
    region: string;
  };
  offer?: {
    product: {
      name: string;
      unit: string;
    };
    quantity: number;
    unit_price: number;
  };
}

export default function ReceivedPurchasesPage() {
  const t = useTranslations('ReceivedPurchases');
  const tMatches = useTranslations('Matches'); // Add Matches translations
  const router = useRouter();
  const [purchases, setPurchases] = useState<DirectPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { showToast } = useToast();

  const fetchPurchases = useCallback(async () => {
    try {
      const response = await api.get('/direct-purchases/received');
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

  const updatePurchaseStatus = async (purchaseId: number, status: string) => {
    try {
      await api.put(`/direct-purchases/${purchaseId}/status`, { status });
      setPurchases(prev =>
        prev.map(p => p.id === purchaseId ? { ...p, status } : p)
      );
      showToast(
        status === 'accepted' ? t('acceptSuccess') : t('rejectSuccess'),
        status === 'accepted' ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Failed to update purchase status', err);
      showToast(t('updateError'), 'error');
    }
  };

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
            <FontAwesomeIcon icon={faShoppingBag} className="text-primary" />
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
            <p className="text-foreground/60">
              {filter === 'all' ? t('noPurchases') : 
               filter === 'pending' ? t('noPurchasesPending') : 
               filter === 'accepted' ? t('noPurchasesAccepted') : t('noPurchasesRejected')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {purchase.offer?.product?.name || 'Produit inconnu'}
                    </h3>
                    <p className="text-sm text-foreground/60">
                      {t('offeredBy', { name: purchase.collector.full_name })}
                    </p>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('collectorOffer')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('offerDetails', { 
                        quantity: purchase.quantity, 
                        unit: purchase.offer?.product?.unit || 'unités', 
                        price: purchase.unit_price.toLocaleString() 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('yourPrice')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('priceDetails', { 
                        price: purchase.offer?.unit_price?.toLocaleString() || 'N/A', 
                        unit: purchase.offer?.product?.unit || 'unité' 
                      })}
                    </p>
                  </div>
                </div>

                {purchase.message && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-1">{t('message')}</p>
                    <p className="text-sm text-foreground italic">&quot;{purchase.message}&quot;</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-foreground/60">
                      {formatDistanceToNow(parseBackendDate(purchase.created_at), { addSuffix: true, locale: getDateLocale() })}
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">
                      {t('contact', { email: purchase.collector.email })}
                    </p>
                  </div>
                  {purchase.status === 'accepted' && (
                    <button
                      onClick={() => router.push(`/dashboard/chat?user_id=${purchase.collector.id}`)}
                      className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-comments"></i>
                      {tMatches('openDiscussion')}
                    </button>
                  )}
                  {purchase.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updatePurchaseStatus(purchase.id, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        {t('reject')}
                      </button>
                      <button
                        onClick={() => updatePurchaseStatus(purchase.id, 'accepted')}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {t('accept')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
