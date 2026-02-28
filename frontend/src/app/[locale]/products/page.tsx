'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import api, { BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
  image_url?: string;
  offer_count?: number;
}

export default function ProductsPage() {
  const t = useTranslations('Products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-foreground/40">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white dark:bg-slate-800 rounded-4xl p-5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
              <div className="aspect-square rounded-3xl bg-slate-50 dark:bg-slate-900 mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative shadow-inner">
                {product.image_url ? (
                    <Image 
                      src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}`} 
                      alt={product.name} 
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                      <FontAwesomeIcon icon={faLeaf} size="lg" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                   <span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-primary/10">
                     {product.category}
                   </span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {product.description || t('noDescription')}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                   {t('unit')}: {product.unit}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-4">
                <Link 
                  href={`/offers?product=${product.id}`}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 rounded-xl text-center text-sm font-bold hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  {t('viewOffers', { count: product.offer_count || 0 })}
                </Link>
                {!isLoading && user?.user_type !== 'agriculteur' && (
                  <Link 
                    href="/dashboard/collecteur"
                    className="w-full py-3 px-4 bg-primary text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all duration-300"
                  >
                    {t('requestProduct')}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-foreground/50">{t('noResults', { searchTerm })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
