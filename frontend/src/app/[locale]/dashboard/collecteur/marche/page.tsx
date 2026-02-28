"use client";

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api, { BASE_URL } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faFilter, faSearch, faBox, faThLarge, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
import L from 'leaflet';

// Fix for default marker icon
const DefaultIcon = typeof window !== 'undefined' ? L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : null;



interface Offer {
  id: number;
  quantity: number;
  unit_price: number;
  description: string;
  location_region: string;
  location_commune: string;
  latitude?: number;
  longitude?: number;
  product: {
    id: number;
    name: string;
    unit: string;
  };
  farmer: {
    full_name: string;
  };
  created_at: string;
  image_url?: string;
}

export default function MarketplacePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    product_id: "",
    min_price: "",
    max_price: "",
    region: ""
  });
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { showToast } = useToast();
  const router = useRouter();
  const t = useTranslations('Marketplace');
  const c = useTranslations('Common');


  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (filters.product_id) params.product_id = filters.product_id;

      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.region) params.region = filters.region;
      
      const response = await api.get('/offers/', { params });
      setOffers(response.data);
    } catch (err) {
      console.error("Failed to fetch offers", err);
      showToast(t('loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast, t]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleBuy = (offer: Offer) => {
    // Redirect to direct purchase form
    router.push(`/offers/${offer.id}/purchase`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-primary" />
                {t('filters')}
              </h2>
              <button 
                onClick={() => setFilters({ product_id: "", min_price: "", max_price: "", region: "" })}
                className="text-xs text-primary hover:underline"
              >
                {t('reset')}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{t('product')}</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  value={filters.product_id}
                  onChange={(e) => setFilters({...filters, product_id: e.target.value})}
                >
                  <option value="">{t('allProducts')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{t('price')} (Ar)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    value={filters.min_price}
                    onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    value={filters.max_price}
                    onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{c('region')}</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                >
                  <option value="">{t('allRegions')}</option>
                  <option value="Antananarivo">Antananarivo</option>
                  <option value="Antsirabe">Antsirabe</option>
                  <option value="Fianarantsoa">Fianarantsoa</option>
                  <option value="Toamasina">Toamasina</option>
                  <option value="Mahajanga">Mahajanga</option>
                  <option value="Toliara">Toliara</option>
                  <option value="Antsiranana">Antsiranana</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-foreground/60">{t('subtitle')}</p>
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input 
                type="text" 
                placeholder={c('search')}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/60 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <FontAwesomeIcon icon={faThLarge} className="mr-2" />
                {t('grid')}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/60 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                {t('map')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-52 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    {offer.image_url ? (
                      <Image 
                        src={offer.image_url.startsWith('http') ? offer.image_url : `${BASE_URL}${offer.image_url}`} 
                        alt={offer.product.name} 
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />

                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-foreground/10 group-hover:scale-110 transition-transform duration-500">
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-full text-sm font-bold shadow-lg text-primary">
                      {offer.unit_price.toLocaleString()} Ar / {offer.product.unit}
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] font-medium text-white uppercase tracking-wider">
                      {offer.location_region}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{offer.product.name}</h3>
                      <p className="text-xs text-foreground/50 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {t('soldBy', { name: offer.farmer.full_name })}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                        <p className="text-[10px] text-foreground/50 uppercase font-bold mb-1">{t('quantity')}</p>
                        <p className="text-sm font-bold text-foreground">{offer.quantity} {offer.product.unit}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                        <p className="text-[10px] text-foreground/50 uppercase font-bold mb-1">{c('commune')}</p>
                        <p className="text-sm font-bold text-foreground truncate">{offer.location_commune}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/offers/${offer.id}`)}
                        className="flex-1 py-3 border border-gray-200 dark:border-slate-700 text-foreground rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {t('details')}
                      </button>
                      <button
                        onClick={() => handleBuy(offer)}
                        className="flex-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                      >
                        {t('buy')}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm z-0">
              <MapContainer 
                center={[-18.8792, 47.5079]} 
                zoom={6} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {offers.filter(o => o.latitude && o.longitude).map(offer => (
                  <Marker 
                    key={offer.id} 
                    position={[offer.latitude!, offer.longitude!]}
                    icon={DefaultIcon!}
                  >
                    <Popup>
                      <div className="p-2 min-w-[150px]">
                        <h3 className="font-bold text-primary">{offer.product.name}</h3>
                        <p className="text-xs font-medium">{offer.quantity} {offer.product.unit} - {offer.unit_price} Ar</p>
                        <p className="text-[10px] text-gray-500 mb-2">{offer.location_commune}, {offer.location_region}</p>
                        <button 
                          onClick={() => router.push(`/offers/${offer.id}`)}
                          className="w-full py-1.5 bg-primary text-white text-[10px] rounded font-bold"
                        >
                          {t('viewDetails')}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );

}
