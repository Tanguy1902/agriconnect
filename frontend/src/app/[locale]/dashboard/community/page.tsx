"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faComments, faUser } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface CommunityUser {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
  region: string | null;
  commune: string | null;
  profile_picture: string | null;
}

export default function CommunityPage() {
  const t = useTranslations('Community');
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        // If farmer, look for collectors. If collector, look for farmers.
        const targetType = user.user_type === 'agriculteur' ? 'collecteur' : 'agriculteur';
        const res = await api.get(`/users/?user_type=${targetType}`);
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch community users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === "" || (u.region && u.region.toLowerCase().includes(regionFilter.toLowerCase()));
    return matchesSearch && matchesRegion;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground/60">
            {user?.user_type === 'agriculteur' ? t('subtitleCollectors') : t('subtitleFarmers')}
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder={t('regionPlaceholder')}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/50"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-primary/20 relative">
                    {u.profile_picture ? (
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${u.profile_picture}`}
                        alt={u.full_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{u.full_name}</h3>
                    <p className="text-sm text-foreground/60 capitalize">{u.user_type}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary w-4" />
                    <span>{u.region || t('unspecifiedRegion')}{u.commune ? `, ${u.commune}` : ''}</span>
                  </div>
                </div>

                <button 
                  className="w-full py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  onClick={() => router.push(`/dashboard/chat?user_id=${u.id}`)}
                >
                  <FontAwesomeIcon icon={faComments} />
                  {t('contact')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-foreground/60">{t('noUsers')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
