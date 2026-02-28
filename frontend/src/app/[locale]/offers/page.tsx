'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import api, { BASE_URL } from '@/lib/api';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';


import { useTranslations } from 'next-intl';


interface Product {
  id: number;
  name: string;
  unit: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface Offer {
  id: number;
  quantity: number;
  unit_price: number;
  quality?: string;
  description?: string;
  location_region?: string;
  location_commune?: string;
  product: Product;
  farmer: User;
  created_at: string;
  image_url?: string;
}

function OffersList() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const t = useTranslations('Offers');
  const c = useTranslations('Common');
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const url = productId ? `/offers/?product_id=${productId}` : '/offers/';
        const response = await api.get(url);
        setOffers(response.data);
      } catch (err) {
        console.error("Failed to fetch offers", err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [productId, t]);

  const filteredOffers = offers.filter(offer => 
    offer.product.name.toLowerCase().includes(filter.toLowerCase()) ||
    (offer.location_region && offer.location_region.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">{t('title')}</h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder={t('filterPlaceholder')}
            className="flex-1 px-6 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select className="px-6 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none cursor-pointer">
            <option value="">{t('allRegions')}</option>
            <option value="Antananarivo">Antananarivo</option>
            <option value="Antsirabe">Antsirabe</option>
            <option value="Fianarantsoa">Fianarantsoa</option>
          </select>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="group bg-white dark:bg-slate-900 rounded-4xl p-5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-slate-800/50 flex flex-col h-full">
                <div className="aspect-4/3 rounded-3xl bg-slate-50 dark:bg-slate-800 mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative shadow-inner">
                  {offer.image_url ? (
                    <Image 
                      src={offer.image_url.startsWith('http') ? offer.image_url : `${BASE_URL}${offer.image_url}`} 
                      alt={offer.product.name} 
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                      <FontAwesomeIcon icon={faBox} size="lg" />
                    </div>
                  )}
                  {/* Category removed as it's not in the data model */}
                  <div className="absolute bottom-4 right-4">
                    <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                      {offer.unit_price.toLocaleString()} Ar / {offer.product.unit}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-1 px-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300 line-clamp-1">{offer.product.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 dark:text-slate-500">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                      <span className="text-xs font-bold uppercase tracking-wider">{offer.location_region || c('notFound')}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {offer.description || "Produit frais de qualité supérieure, récolté localement."}
                  </p>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {offer.farmer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('farmer')}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{offer.farmer.full_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('quantity')}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{offer.quantity} {offer.product.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-800/50 px-2">
                  <Link 
                    href={`/offers/${offer.id}`}
                    className="w-full py-4 px-6 bg-primary text-white rounded-2xl text-center text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {t('viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="text-slate-300 dark:text-slate-700 mb-4">
              <FontAwesomeIcon icon={faBox} size="3x" />
            </div>
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">{t('noOffers')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OffersPage() {
  const c = useTranslations('Common');
  return (
    <Suspense fallback={<div className="p-12 text-center">{c('loading')}</div>}>
      <OffersList />
    </Suspense>
  );
}
