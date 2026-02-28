"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface Farmer {
  id: string;
  full_name: string;
}

interface Offer {
  id: number;
  product: Product;
  farmer: Farmer;
  quantity: number;
  unit_price: number;
  quality: string;
  description: string;
  image_url: string;
  location_region: string;
  location_commune: string;
}

export default function DirectPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations('DirectPurchase');
  const c = useTranslations('Common');
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    unit_price: '',
    message: ''
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await api.get(`/offers/${params.id}`);
        setOffer(res.data);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            unit_price: res.data.unit_price.toString()
          }));
        }
      } catch (err) {
        console.error("Failed to fetch offer", err);
        showToast(t('loadError'), 'error');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchOffer();
    }
  }, [params.id, showToast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;

    setSubmitting(true);
    try {
      const payload = {
        offer_id: offer.id,
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        message: formData.message
      };

      await api.post('/direct-purchases/', payload);
      showToast(t('success'), 'success');
      router.push('/dashboard/collecteur');
    } catch (err) {
      console.error("Failed to create purchase", err);
      showToast(t('error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{c('loading')}</div>;
  if (!offer) return <div className="p-8 text-center">{c('notFound')}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Offer Details */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="relative h-64 w-full bg-gray-200">
              {offer.image_url ? (
                <Image
                  src={offer.image_url.startsWith('http') ? offer.image_url : `${BASE_URL}${offer.image_url}`}
                  alt={offer.product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />

              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {c('noImage')}
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{offer.product.name}</h2>
              <div className="space-y-2 text-foreground/80">
                <p><span className="font-medium">{t('farmer')}:</span> {offer.farmer.full_name}</p>
                <p><span className="font-medium">{t('location')}:</span> {offer.location_commune}, {offer.location_region}</p>
                <p><span className="font-medium">{t('quantityAvailable')}:</span> {offer.quantity} {offer.product.unit}</p>
                <p><span className="font-medium">{t('unitPrice')}:</span> {offer.unit_price.toLocaleString()} Ar / {offer.product.unit}</p>
                {offer.quality && <p><span className="font-medium">{t('quality')}:</span> {offer.quality}</p>}
                {offer.description && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm italic">{offer.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('title')}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('quantityToBuy')} ({offer.product.unit})</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                max={offer.quantity}
                min="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('unitPrice')}</label>
              <input
                type="number"
                step="1"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                min="1"
              />
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex justify-between items-center text-primary font-bold">
                <span>{t('totalPrice')}</span>
                <span className="text-2xl">
                  {((parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_price) || 0)).toLocaleString()} Ar
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('message')}</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                placeholder={t('messagePlaceholder')}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-slate-700 text-foreground rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {c('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {submitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
