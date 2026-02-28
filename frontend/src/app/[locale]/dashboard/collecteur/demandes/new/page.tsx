"use client";

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';

interface Product {
  id: number;
  name: string;
  unit: string;
}

function NewDemandForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const t = useTranslations('NewDemand');
  const c = useTranslations('Common');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    quantity: "",
    max_unit_price: "",
    desired_delivery_date: "",
    quality_required: "",
    description: ""
  });

  const [isCustomProduct, setIsCustomProduct] = useState(false);

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        showToast(t('loadProductsError'), 'error');
      }
    };
    fetchProducts();

    // Pre-fill from query params (Marketplace)
    const paramProductId = searchParams.get('product_id');
    const paramQuantity = searchParams.get('quantity');
    const paramPrice = searchParams.get('max_unit_price');

    if (paramProductId) {
      setFormData(prev => ({
        ...prev,
        product_id: paramProductId,
        quantity: paramQuantity || "",
        max_unit_price: paramPrice || ""
      }));
    }
  }, [searchParams, showToast, t]);

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

    setLoading(true);
    try {
      const payload: {
        quantity: number;
        max_unit_price: number | null;
        desired_delivery_date: string | null;
        quality_required: string;
        description: string;
        product_id?: number | null;
        product_name?: string;
      } = {
        quantity: parseFloat(formData.quantity),
        max_unit_price: formData.max_unit_price ? parseFloat(formData.max_unit_price) : null,
        desired_delivery_date: formData.desired_delivery_date || null,
        quality_required: formData.quality_required,
        description: formData.description
      };

      if (isCustomProduct) {
        payload.product_name = formData.product_name;
        payload.product_id = null;
      } else {
        payload.product_id = parseInt(formData.product_id);
      }

      await api.post('/demands/', payload);
      showToast(t('success'), 'success');
      router.push('/dashboard/collecteur');
    } catch (err) {
      console.error("Failed to create demand", err);
      showToast(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-foreground/60">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t('productLabel')}</label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
            value={isCustomProduct ? 'custom' : formData.product_id}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setIsCustomProduct(true);
                setFormData({...formData, product_id: ""});
              } else {
                setIsCustomProduct(false);
                setFormData({...formData, product_id: e.target.value});
              }
            }}
            required
          >
            <option value="">{t('productPlaceholder')}</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
            ))}
            <option value="custom">{t('customProduct')}</option>
          </select>
        </div>

        {isCustomProduct && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('productNameLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('productNamePlaceholder')}
              value={formData.product_name || ""}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('quantityLabel')}</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
              min="0.01"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('priceLabel')}</label>
            <input
              type="number"
              step="1"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.max_unit_price}
              onChange={(e) => setFormData({...formData, max_unit_price: e.target.value})}
              min="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t('qualityLabel')}</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
            placeholder={t('qualityPlaceholder')}
            value={formData.quality_required}
            onChange={(e) => setFormData({...formData, quality_required: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">{t('deliveryDateLabel')}</label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
            value={formData.desired_delivery_date}
            onChange={(e) => setFormData({...formData, desired_delivery_date: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
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
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDemandPage() {
  const c = useTranslations('Common');
  return (
    <DashboardLayout>
      <Suspense fallback={<div>{c('loading')}</div>}>
        <NewDemandForm />
      </Suspense>
    </DashboardLayout>
  );
}
