"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseBackendDate } from '@/utils/dateUtils';

interface Match {
  id: number;
  match_score: number;
  matching_reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'completed';
  created_at: string;
  offer?: {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    farmer_name: string;
    location: string;
    farmer?: {
      id: number;
      full_name: string;
    };
  };
  demand?: {
    id: number;
    product_name: string;
    quantity: number;
    collector_name: string;
    collector?: {
      id: number;
      full_name: string;
    };
  };
}

export default function MatchesList({ userType }: { userType: 'agriculteur' | 'collecteur' }) {
  const t = useTranslations('Matches');
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches/');
      setMatches(response.data);
    } catch (err) {
      console.error("Failed to fetch matches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleAction = async (matchId: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/matches/${matchId}/${action}`);
      showToast(
        action === 'accept' ? t('successAccept') : t('successReject'), 
        action === 'accept' ? 'success' : 'info'
      );
      fetchMatches(); // Refresh list
    } catch (err) {
      console.error(`Failed to ${action} match`, err);
      showToast(t('error'), 'error');
    }
  };

  // date-fns doesn't have Malagasy locale, use French as fallback
  const getDateLocale = () => fr;

  if (loading) return <div className="text-center py-8">{t('loading')}</div>;

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
        <p className="text-foreground/50">{t('noMatches')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2 pb-6">
      {matches.map((match) => (
        <div key={match.id} className="group bg-white dark:bg-slate-900 p-6 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  {match.match_score}%
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-primary flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {userType === 'agriculteur' 
                    ? t('demandFor', { product: match.demand?.product_name || '' }) 
                    : t('offerFor', { product: match.offer?.product_name || '' })
                  }
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    match.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    match.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {t(`status.${match.status}`)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {format(parseBackendDate(match.created_at), 'PP', { locale: getDateLocale() })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t('details')}</p>
              <div className="space-y-2">
                {userType === 'agriculteur' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('quantity')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{match.demand?.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('collector')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{match.demand?.collector_name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('quantity')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{match.offer?.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('price')}:</span>
                      <span className="font-bold text-primary">{match.offer?.unit_price.toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('farmer')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{match.offer?.farmer_name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">{t('analysis')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">&quot;{match.matching_reason}&quot;</p>
            </div>
          </div>

          {match.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAction(match.id, 'accept')}
                className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all hover:-translate-y-1"
              >
                {t('acceptAndContact')}
              </button>
              <button
                onClick={() => {
                  const otherUser = userType === 'agriculteur' 
                    ? match.demand?.collector 
                    : match.offer?.farmer;
                  if (otherUser?.id) {
                    router.push(`/dashboard/chat?user_id=${otherUser.id}`);
                  }
                }}
                className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-600 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <i className="fas fa-comments"></i>
                {t('discuss')}
              </button>
              <button
                onClick={() => handleAction(match.id, 'reject')}
                className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {t('ignore')}
              </button>
            </div>
          )}
          
          {match.status === 'accepted' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-center font-bold text-sm border border-emerald-100 dark:border-emerald-800/30">
                {t('contactEstablished')}
              </div>
              <button
                onClick={() => {
                  const otherUser = userType === 'agriculteur' 
                    ? match.demand?.collector 
                    : match.offer?.farmer;
                  if (otherUser?.id) {
                    router.push(`/dashboard/chat?user_id=${otherUser.id}`);
                  }
                }}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <i className="fas fa-comments"></i>
                {t('openDiscussion')}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
