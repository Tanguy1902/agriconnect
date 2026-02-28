"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

interface Demand {
  id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  max_unit_price?: number;
  desired_delivery_date?: string;
  quality_required?: string;
  special_requirements?: string;
  product?: {
    name: string;
    unit: string;
  };
}

export default function EditDemandPage() {
  const t = useTranslations('EditDemand');
  const c = useTranslations('Common');
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demand, setDemand] = useState<Demand | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: "",
    max_unit_price: "",
    desired_delivery_date: "",
    quality_required: "",
    special_requirements: "",
  });

  const demandId = params.id as string;

  const fetchDemand = useCallback(async () => {
    try {
      const response = await api.get(`/demands/${demandId}`);
      const demandData = response.data;
      setDemand(demandData);
      
      // Pre-fill form
      setFormData({
        quantity: demandData.quantity.toString(),
        max_unit_price: demandData.max_unit_price?.toString() || "",
        desired_delivery_date: demandData.desired_delivery_date || "",
        quality_required: demandData.quality_required || "",
        special_requirements: demandData.special_requirements || "",
      });
    } catch (err) {
      console.error('Failed to fetch demand', err);
      showToast(t('loadError'), 'error');
      router.push('/dashboard/collecteur/demandes');
    } finally {
      setLoading(false);
    }
  }, [demandId, router, showToast, t]);

  useEffect(() => {
    fetchDemand();
  }, [fetchDemand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date
    if (formData.desired_delivery_date) {
      const selectedDate = new Date(formData.desired_delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showToast(t('pastDateError'), 'error');
        return;
      }
    }

    setSubmitting(true);

    try {
      const updateData: Partial<Demand> = {
        quantity: parseFloat(formData.quantity),
      };
      
      if (formData.max_unit_price) {
        updateData.max_unit_price = parseFloat(formData.max_unit_price);
      }
      if (formData.desired_delivery_date) {
        updateData.desired_delivery_date = formData.desired_delivery_date;
      }
      if (formData.quality_required) {
        updateData.quality_required = formData.quality_required;
      }
      if (formData.special_requirements) {
        updateData.special_requirements = formData.special_requirements;
      }

      await api.put(`/demands/${demandId}`, updateData);

      showToast(t('success'), 'success');
      router.push(`/demandes/${demandId}`);
    } catch (err) {
      console.error("Failed to update demand", err);
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

  if (!demand) {
    return null;
  }

  const productName = demand.product?.name || demand.product_name || t('defaultProduct');
  const productUnit = demand.product?.unit || t('defaultUnit');

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
          <p className="text-foreground/60">{t('productLabel', { name: productName })}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('quantityLabel', { unit: productUnit })}
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
                {t('priceLabel', { unit: productUnit })}
              </label>
              <input
                type="number"
                step="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
                value={formData.max_unit_price}
                onChange={(e) => setFormData({...formData, max_unit_price: e.target.value})}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('deliveryDateLabel')}
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.desired_delivery_date}
              onChange={(e) => setFormData({...formData, desired_delivery_date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('qualityLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('qualityPlaceholder')}
              value={formData.quality_required}
              onChange={(e) => setFormData({...formData, quality_required: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('specialRequirementsLabel')}</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              placeholder={t('specialRequirementsPlaceholder')}
              value={formData.special_requirements}
              onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
            />
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
