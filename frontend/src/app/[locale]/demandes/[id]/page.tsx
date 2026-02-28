"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/routing';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faBox, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseBackendDate } from '@/utils/dateUtils';

interface Demand {
  id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  max_unit_price?: number;
  desired_delivery_date?: string;
  quality_required?: string;
  special_requirements?: string;
  status: string;
  created_at: string;
  collector: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    region?: string;
  };
  product?: {
    id: number;
    name: string;
    unit: string;
  };
}

export default function DemandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const demandId = params.id as string;

  const fetchDemand = useCallback(async () => {
    try {
      const response = await api.get(`/demands/${demandId}`);
      setDemand(response.data);
    } catch (err) {
      console.error('Failed to fetch demand', err);
      showToast('Erreur lors du chargement de la demande', 'error');
    } finally {
      setLoading(false);
    }
  }, [demandId, showToast]);

  useEffect(() => {
    fetchDemand();
  }, [fetchDemand]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/demands/${demandId}`);
      showToast('Demande supprimée avec succès', 'success');
      router.push('/dashboard/collecteur/demandes');
    } catch (err) {
      console.error('Failed to delete demand', err);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isOwner = user && demand && user.id === demand.collector.id;

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
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Demande non trouvée</p>
          <Link href="/demandes" className="text-primary hover:underline mt-4 inline-block">
            Retour aux demandes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const productName = demand.product?.name || demand.product_name || 'Produit';
  const productUnit = demand.product?.unit || 'unités';

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
                href={`/dashboard/collecteur/demandes/${demandId}/edit`}
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
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6">
          {/* Title & Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Demande: {productName}
              </h1>
              <p className="text-foreground/60">
                Publié {formatDistanceToNow(parseBackendDate(demand.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              demand.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}>
              {demand.status === 'active' ? 'Active' : demand.status}
            </span>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {demand.max_unit_price && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground/60 mb-1">Prix maximum</p>
                <p className="text-2xl font-bold text-primary">
                  {demand.max_unit_price.toLocaleString()} Ar / {productUnit}
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-foreground/60 mb-1">Quantité recherchée</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FontAwesomeIcon icon={faBox} className="text-blue-600" />
                {demand.quantity} {productUnit}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            {demand.quality_required && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Qualité requise</h3>
                <p className="text-foreground/80">{demand.quality_required}</p>
              </div>
            )}

            {demand.special_requirements && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Exigences spéciales</h3>
                <p className="text-foreground/80">{demand.special_requirements}</p>
              </div>
            )}

            {demand.desired_delivery_date && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="text-primary" />
                  Date de livraison souhaitée
                </h3>
                <p className="text-foreground/80">
                  {new Date(demand.desired_delivery_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>

          {/* Collector Info */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-foreground mb-3">Informations sur le collecteur</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {demand.collector.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{demand.collector.full_name}</p>
                {demand.collector.region && (
                  <p className="text-sm text-foreground/60">{demand.collector.region}</p>
                )}
                {demand.collector.phone && (
                  <p className="text-sm text-foreground/60">{demand.collector.phone}</p>
                )}
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
              Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible et supprimera également tous les matches associés.
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
