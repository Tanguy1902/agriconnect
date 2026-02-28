"use client";

import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Link } from '@/i18n/routing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faTrash, faSave, faExclamationTriangle, faCamera, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading map...</div>
});

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  commune: string;
  latitude?: number;
  longitude?: number;
  profile_picture: string;
}

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    region: "",
    commune: "",
    latitude: undefined,
    longitude: undefined,
    profile_picture: ""
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [deletePassword, setDeletePassword] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/me');
      const u = res.data;
      setProfileData({
        full_name: u.full_name || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.address || "",
        region: u.region || "",
        commune: u.commune || "",
        latitude: u.latitude,
        longitude: u.longitude,
        profile_picture: u.profile_picture || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...updateData } = profileData;
      await api.put('/users/me', updateData);

      showToast(t('successUpdate'), 'success');
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast(t('errorUpdate'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/users/me/password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      showToast(t('passwordSuccess'), 'success');
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error("Failed to update password", err);
      showToast(t('passwordError'), 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      await api.delete('/users/me', { data: { password: deletePassword } });
      showToast(t('deleteSuccess'), 'success');
      logout();
    } catch (err) {
      console.error("Failed to delete account", err);
      showToast(t('deleteError'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground/60">{t('subtitle')}</p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <FontAwesomeIcon icon={faUser} className="text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t('personalInfo')}</h2>
            </div>
            
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl relative">
                    {profileData.profile_picture ? (
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${profileData.profile_picture}`} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors border-2 border-white dark:border-slate-800">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await api.post('/users/me/avatar', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            setProfileData({ ...profileData, profile_picture: res.data.url });
                            showToast(t('avatarSuccess'), 'success');
                          } catch (err) {
                            console.error("Failed to upload avatar", err);
                            showToast(t('avatarError'), 'error');
                          }
                        }
                      }}
                    />
                    <FontAwesomeIcon icon={faCamera} className="text-sm" />
                  </label>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-foreground">{t('profilePicture')}</h3>
                  <p className="text-sm text-foreground/60">{t('profilePictureHint')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('fullName')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('emailReadOnly')}</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 outline-none opacity-60 cursor-not-allowed"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('phone')}</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+261 34 00 000 00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Région</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={profileData.region}
                    onChange={(e) => setProfileData({...profileData, region: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Commune</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={profileData.commune}
                    onChange={(e) => setProfileData({...profileData, commune: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('address')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                  {t('mapLocation')}
                </label>
                <MapPicker 
                  initialLat={profileData.latitude} 
                  initialLng={profileData.longitude} 
                  onLocationSelect={(lat, lng) => setProfileData({...profileData, latitude: lat, longitude: lng})} 
                />
                <p className="text-xs text-foreground/50">
                  {t('mapHint')}
                </p>
              </div>
              <div className="flex justify-end">
                <Link 
                  href="/dashboard/collecteur"
                  className="w-full py-3 px-4 bg-primary text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all duration-300 flex justify-center items-center"
                >
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? t('saving') : t('saveChanges')}
                </Link>
              </div>
            </form>
          </section>

          {/* Password Change */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <FontAwesomeIcon icon={faLock} className="text-blue-600" />
              <h2 className="text-xl font-bold text-foreground">{t('security')}</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('oldPassword')}</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('newPassword')}</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">{t('confirmPassword')}</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {passwordLoading ? t('updating') : t('changePassword')}
                </button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-50 dark:bg-red-900/10 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
            <div className="p-6 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
              <h2 className="text-xl font-bold text-red-600">{t('dangerZone')}</h2>
            </div>
            <div className="p-6">
              <p className="text-red-800 dark:text-red-400 mb-6">
                {t('deleteAccountDesc')}
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  {t('deleteAccount')}
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-red-800 dark:text-red-400">
                      {t('confirmDelete')}
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-red-500/50"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                      placeholder="Mot de passe actuel"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={deleteLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteLoading ? t('deleting') : t('confirmDeleteBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-foreground rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
