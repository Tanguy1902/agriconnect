"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/routing';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api, { BASE_URL } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTag, faWeightHanging, faStore, faBox } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';


interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
  image_url?: string;
  offer_count?: number;
}

interface Offer {
  id: number;
  quantity: number;
  unit_price: number;
  location_region: string;
  farmer: {
    full_name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const productId = params.id as string;

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const [productRes, offersRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get('/offers/', { params: { product_id: productId } })
      ]);
      setProduct(productRes.data);
      setOffers(offersRes.data);
    } catch (err) {
      console.error("Failed to fetch product details", err);
      showToast("Erreur lors du chargement du produit.", 'error');
      router.push('/dashboard/collecteur/marche');
    } finally {
      setLoading(false);
    }
  }, [productId, router, showToast]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="relative h-[400px] rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-xl">
            {product.image_url ? (
              <Image
                src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}`}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />

            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl text-foreground/10">
                <FontAwesomeIcon icon={faBox} />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
              <FontAwesomeIcon icon={faTag} />
              {product.category}
            </div>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">{product.name}</h1>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
              {product.description || "Aucune description disponible pour ce produit."}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-foreground/50 uppercase font-bold mb-1">Unité de mesure</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faWeightHanging} className="text-primary/60" />
                  {product.unit}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-foreground/50 uppercase font-bold mb-1">Offres actives</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faStore} className="text-primary/60" />
                  {product.offer_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Offers for this product */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Offres disponibles pour ce produit</h2>
          {offers.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
              <p className="text-foreground/50">Aucune offre active pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-primary">{offer.unit_price.toLocaleString()} Ar / {product.unit}</p>
                      <p className="text-xs text-foreground/50 mt-1">Par {offer.farmer.full_name}</p>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">
                      Disponible
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-foreground/70 mb-6">
                    <p>Quantité: <span className="font-medium text-foreground">{offer.quantity} {product.unit}</span></p>
                    <p>Lieu: <span className="font-medium text-foreground">{offer.location_region}</span></p>
                  </div>
                  <Link
                    href={`/offers/${offer.id}`}
                    className="block w-full py-3 bg-primary text-primary-foreground text-center rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                  >
                    Voir l&apos;offre
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
