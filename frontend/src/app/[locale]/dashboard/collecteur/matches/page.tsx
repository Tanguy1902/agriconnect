"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faHandshake, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { parseBackendDate } from '@/utils/dateUtils';

interface Match {
  id: number;
  offer_id: number;
  demand_id: number;
  match_score: number;
  status: string;
  created_at: string;
  offer: {
    id: number;
    product: {
      name: string;
      unit: string;
    };
    quantity: number;
    unit_price: number;
    location_region: string;
    farmer: {
      full_name: string;
      region: string;
    };
  };
  demand: {
    id: number;
    product_name: string;
    quantity: number;
    max_unit_price: number;
  };
}

export default function CollectorMatchesPage() {
  const t = useTranslations('CollectorMatches');

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches/me');
        setMatches(response.data);
      } catch (err) {
        console.error('Failed to fetch matches', err);
        showToast(t('loadError'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [showToast, t]);

  const updateMatchStatus = async (matchId: number, status: string) => {
    try {
      await api.put(`/matches/${matchId}/status`, { status });
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, status } : m)
      );
      showToast(
        status === 'accepted' ? t('acceptSuccess') : t('rejectSuccess'),
        status === 'accepted' ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Failed to update match status', err);
      showToast(t('updateError'), 'error');
    }
  };

  const filteredMatches = filter === 'all' 
    ? matches
    : matches.filter(m => m.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">{t('status.pending')}</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">{t('status.accepted')}</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">{t('status.rejected')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getDateLocale = () => {
    return fr; // Fallback to French since Malagasy locale is not available in date-fns
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FontAwesomeIcon icon={faHandshake} className="text-primary" />
            {t('title')}
          </h1>
          <p className="text-foreground/60 mt-2">
            {t('subtitle')}
          </p>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterAll', { count: matches.length })}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterPending', { count: matches.filter(m => m.status === 'pending').length })}
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterAccepted', { count: matches.filter(m => m.status === 'accepted').length })}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-foreground/40 mb-4" />
            <p className="text-foreground/60">
              {filter === 'all' ? t('noMatches') : filter === 'pending' ? t('noMatchesPending') : filter === 'accepted' ? t('noMatchesAccepted') : t('noMatchesRejected')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getMatchScoreColor(match.match_score)}`}>
                      {match.match_score}%
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {match.offer.product.name}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {t('offeredBy', { name: match.offer.farmer.full_name })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(match.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('yourDemand')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('demandDetails', { 
                        quantity: match.demand.quantity, 
                        unit: match.offer.product.unit, 
                        price: match.demand.max_unit_price?.toLocaleString() || 'N/A' 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-foreground/60 mb-2">{t('farmerOffer')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {t('offerDetails', { 
                        quantity: match.offer.quantity, 
                        unit: match.offer.product.unit, 
                        price: match.offer.unit_price.toLocaleString() 
                      })}
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">{match.offer.location_region}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-foreground/60">
                    {formatDistanceToNow(parseBackendDate(match.created_at), { addSuffix: true, locale: getDateLocale() })}
                  </p>
                  {match.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMatchStatus(match.id, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        {t('reject')}
                      </button>
                      <button
                        onClick={() => updateMatchStatus(match.id, 'accepted')}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {t('accept')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
