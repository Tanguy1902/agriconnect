"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/routing';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api, { BASE_URL } from '@/lib/api';
import Image from 'next/image';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapMarkerAlt, faBox, faShoppingCart, faEdit, faTrash, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseBackendDate } from '@/utils/dateUtils';

interface Offer {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  quality?: string;
  description?: string;
  harvest_date?: string;
  location_region?: string;
  location_commune?: string;
  image_url?: string;
  status: string;
  created_at: string;
  farmer: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    region?: string;
  };
  product: {
    id: number;
    name: string;
    unit: string;
    category?: string;
    image_url?: string;
  };
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const offerId = params.id as string;

  const fetchOffer = useCallback(async () => {
    try {
      const response = await api.get(`/offers/${offerId}`);
      setOffer(response.data);
    } catch (err) {
      console.error('Failed to fetch offer', err);
      showToast('Erreur lors du chargement de l\'offre', 'error');
    } finally {
      setLoading(false);
    }
  }, [offerId, showToast]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/offers/${offerId}`);
      showToast('Offre supprimée avec succès', 'success');
      router.push('/dashboard/agriculteur/offres');
    } catch (err) {
      console.error('Failed to delete offer', err);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isOwner = user && offer && user.id === offer.farmer.id;
  const isCollector = user && user.user_type === 'collecteur';

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
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Offre non trouvée</p>
          <Link href="/offers" className="text-primary hover:underline mt-4 inline-block">
            Retour aux offres
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour
          </button>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/agriculteur/offres/${offerId}/edit`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} />
                Modifier
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                Supprimer
              </button>
            </div>
          )}

          {isCollector && (
            <Link
              href={`/offers/${offerId}/purchase`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              Faire une offre d&apos;achat
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {/* Image */}
          {(offer.image_url || offer.product.image_url) && (
            <div className="relative w-full h-64 bg-gray-100 dark:bg-slate-700 overflow-hidden">
              <Image
                src={(offer.image_url || offer.product.image_url || '').startsWith('http') 
                  ? (offer.image_url || offer.product.image_url || '') 
                  : `${BASE_URL}${offer.image_url || offer.product.image_url}`}
                alt={offer.product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}


          <div className="p-6">
            {/* Title & Status */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {offer.product.name}
                </h1>
                <p className="text-foreground/60">
                  Publié {formatDistanceToNow(parseBackendDate(offer.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                offer.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {offer.status === 'active' ? 'Active' : offer.status}
              </span>
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground/60 mb-1">Prix unitaire</p>
                <p className="text-2xl font-bold text-primary">
                  {offer.unit_price.toLocaleString()} Ar / {offer.product.unit}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-foreground/60 mb-1">Quantité disponible</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faBox} className="text-blue-600" />
                  {offer.quantity} {offer.product.unit}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              {offer.quality && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Qualité</h3>
                  <p className="text-foreground/80">{offer.quality}</p>
                </div>
              )}

              {offer.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-foreground/80">{offer.description}</p>
                </div>
              )}

              {(offer.location_region || offer.location_commune) && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                    Localisation
                  </h3>
                  <p className="text-foreground/80">
                    {offer.location_commune && `${offer.location_commune}, `}
                    {offer.location_region}
                  </p>
                </div>
              )}

              {offer.harvest_date && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-primary" />
                    Date de récolte
                  </h3>
                  <p className="text-foreground/80">
                    {parseBackendDate(offer.harvest_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            {/* Farmer Info */}
            <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
              <h3 className="font-semibold text-foreground mb-3">Informations sur l&apos;agriculteur</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {offer.farmer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{offer.farmer.full_name}</p>
                  {offer.farmer.region && (
                    <p className="text-sm text-foreground/60">{offer.farmer.region}</p>
                  )}
                  {offer.farmer.phone && (
                    <p className="text-sm text-foreground/60">{offer.farmer.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Confirmer la suppression</h3>
            <p className="text-foreground/80 mb-6">
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible et supprimera également tous les matches associés.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-foreground/80 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
