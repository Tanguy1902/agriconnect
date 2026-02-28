"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api, { BASE_URL } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlus, faEdit, faTrash, faExclamationTriangle, faBox } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';


interface Offer {
  id: number;
  quantity: number;
  unit_price: number;
  description: string;
  location_region: string;
  location_commune: string;
  status: string;
  product: {
    id: number;
    name: string;
    unit: string;
  };
  created_at: string;
  image_url?: string;
}

export default function FarmerOffersPage() {
  const t = useTranslations('FarmerOffers');
  const m = useTranslations('Marketplace');
  const c = useTranslations('Common');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOffers = useCallback(async () => {
    try {
      const response = await api.get('/offers/me');
      setOffers(response.data);
    } catch (err) {
      console.error('Failed to fetch offers', err);
      showToast(t('loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const deleteOffer = async (offerId: number) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      await api.delete(`/offers/${offerId}`);
      setOffers(prev => prev.filter(o => o.id !== offerId));
      showToast(t('deleteSuccess'), 'success');
    } catch (err) {
      console.error('Failed to delete offer', err);
      showToast(t('deleteError'), 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">{t('status.active')}</span>;
      case 'sold':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">{t('status.sold')}</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{t('status.expired')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{status}</span>;
    }
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
            href="/dashboard/agriculteur/offres/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t('newOffer')}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-foreground/40 mb-4" />
            <p className="text-foreground/60 mb-4">
              {t('noOffers')}
            </p>
            <Link
              href="/dashboard/agriculteur/offres/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('createFirst')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  {offer.image_url ? (
                    <Image 
                      src={offer.image_url.startsWith('http') ? offer.image_url : `${BASE_URL}${offer.image_url}`} 
                      alt={offer.product.name} 
                      fill
                      unoptimized
                      className="object-cover" 
                    />

                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-foreground/10">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    {getStatusBadge(offer.status)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{offer.product.name}</h3>
                  
                  <div className="space-y-2 text-sm text-foreground/70 mb-4">
                    <p>
                      {m('quantity')}: <span className="font-medium text-foreground">{offer.quantity} {offer.product.unit}</span>
                    </p>
                    <p>
                      {m('price')}: <span className="font-medium text-foreground">{offer.unit_price.toLocaleString()} Ar/{offer.product.unit}</span>
                    </p>
                    <p>
                      {c('location')}: <span className="font-medium text-foreground">{offer.location_commune}, {offer.location_region}</span>
                    </p>
                    {offer.description && (
                      <p className="italic text-xs mt-2">&quot;{offer.description}&quot;</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <Link
                      href={`/offers/${offer.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {m('details')}
                    </Link>
                    <Link
                      href={`/dashboard/agriculteur/offres/${offer.id}/edit`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      {c('edit')}
                    </Link>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
                      title={c('delete')}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
