"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">Chargement de la carte...</div>
});

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
}

export default function NewOfferPage() {
  const t = useTranslations('NewOffer');
  const c = useTranslations('Common');
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
    description: "",
    location_region: "",
    location_commune: "",
    latitude: "",
    longitude: "",
    // New product fields
    new_product_name: "",
    new_product_unit: "kg",
    new_product_category: "Autre"
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  useEffect(() => {
    // Fetch available products
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
    
    // Pre-fill location if available in user profile
    if (user) {
      setFormData(prev => ({
        ...prev,
        location_region: user.region || "",
        location_commune: user.commune || "",
        latitude: user.latitude?.toString() || "",
        longitude: user.longitude?.toString() || ""
      }));
    }
  }, [user, showToast, t]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") {
      setIsNewProduct(true);
      setFormData(prev => ({ ...prev, product_id: "" }));
    } else {
      setIsNewProduct(false);
      setFormData(prev => ({ ...prev, product_id: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalProductId = formData.product_id;

      // 1. Create Product if new
      if (isNewProduct) {
        const productResponse = await api.post('/products/', {
          name: formData.new_product_name,
          category: formData.new_product_category,
          unit: formData.new_product_unit
        });
        finalProductId = productResponse.data.id;
      }

      // 2. Create Offer with FormData
      const data = new FormData();
      data.append('product_id', finalProductId as string);
      data.append('quantity', formData.quantity);
      data.append('unit_price', formData.unit_price);
      if (formData.description) data.append('description', formData.description);
      if (formData.location_region) data.append('location_region', formData.location_region);
      if (formData.location_commune) data.append('location_commune', formData.location_commune);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (selectedImage) {
        data.append('image', selectedImage);
      }

      await api.post('/offers/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast(t('success'), 'success');
      router.push('/dashboard/agriculteur');
    } catch (err) {
      console.error("Failed to create offer", err);
      showToast(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground/60">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('productLabel')}</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              value={isNewProduct ? "new" : formData.product_id}
              onChange={handleProductChange}
              required
            >
              <option value="">{t('productPlaceholder')}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
              ))}
              <option value="new">{t('customProduct')}</option>
            </select>
          </div>

          {/* New Product Fields */}
          {isNewProduct && (
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-4 border border-gray-200 dark:border-slate-600">
              <h3 className="font-medium text-primary">{t('newProductTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-foreground/70">{t('productNameLabel')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={t('productNamePlaceholder')}
                    value={formData.new_product_name}
                    onChange={(e) => setFormData({...formData, new_product_name: e.target.value})}
                    required={isNewProduct}
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-foreground/70">{t('unitLabel')}</label>
                  <select
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.new_product_unit}
                    onChange={(e) => setFormData({...formData, new_product_unit: e.target.value})}
                  >
                    <option value="kg">{t('units.kg')}</option>
                    <option value="tonne">{t('units.tonne')}</option>
                    <option value="piece">{t('units.piece')}</option>
                    <option value="litre">{t('units.litre')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('quantityLabel')}</label>
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
              <label className="block text-sm font-medium text-foreground">{t('priceLabel')}</label>
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
            <label className="block text-sm font-medium text-foreground">{t('imageLabel')}</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
              onChange={handleImageChange}
            />
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

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
              {t('preciseLocation')}
            </label>
            <MapPicker 
              initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined} 
              initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined} 
              onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat.toString(), longitude: lng.toString()})} 
            />
            <p className="text-xs text-foreground/50">
              {t('locationHint')}
            </p>
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
    </DashboardLayout>
  );
}
