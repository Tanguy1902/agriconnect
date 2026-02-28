"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

interface Offer {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  quality?: string;
  description?: string;
  location_region?: string;
  location_commune?: string;
  image_url?: string;
  product: {
    name: string;
    unit: string;
  };
}

export default function EditOfferPage() {
  const t = useTranslations('EditOffer');
  const c = useTranslations('Common');
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: "",
    unit_price: "",
    quality: "",
    description: "",
    location_region: "",
    location_commune: "",
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const offerId = params.id as string;

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await api.get(`/offers/${offerId}`);
        const offerData = response.data;
        setOffer(offerData);
        
        // Pre-fill form
        setFormData({
          quantity: offerData.quantity.toString(),
          unit_price: offerData.unit_price.toString(),
          quality: offerData.quality || "",
          description: offerData.description || "",
          location_region: offerData.location_region || "",
          location_commune: offerData.location_commune || "",
        });
      } catch (err) {
        console.error('Failed to fetch offer', err);
        showToast(t('loadError'), 'error');
        router.push('/dashboard/agriculteur/offres');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId, router, showToast, t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('quantity', formData.quantity);
      data.append('unit_price', formData.unit_price);
      if (formData.quality) data.append('quality', formData.quality);
      if (formData.description) data.append('description', formData.description);
      if (formData.location_region) data.append('location_region', formData.location_region);
      if (formData.location_commune) data.append('location_commune', formData.location_commune);
      if (selectedImage) {
        data.append('image', selectedImage);
      }

      await api.put(`/offers/${offerId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast(t('success'), 'success');
      router.push(`/offers/${offerId}`);
    } catch (err) {
      console.error("Failed to update offer", err);
      showToast(t('error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!offer) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {c('back')}
          </button>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground/60">{t('productLabel', { name: offer.product.name })}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('quantityLabel', { unit: offer.product.unit })}
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
                min="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('priceLabel', { unit: offer.product.unit })}
              </label>
              <input
                type="number"
                step="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('qualityLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('qualityPlaceholder')}
              value={formData.quality}
              onChange={(e) => setFormData({...formData, quality: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('newImageLabel')}</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              onChange={handleImageChange}
            />
            {offer.image_url && !selectedImage && (
              <p className="text-sm text-foreground/60">{t('currentImage', { name: offer.image_url.split('/').pop() || '' })}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('descriptionLabel')}</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              placeholder={t('descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{c('region')}</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.location_region}
                onChange={(e) => setFormData({...formData, location_region: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{c('commune')}</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.location_commune}
                onChange={(e) => setFormData({...formData, location_commune: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              {c('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
