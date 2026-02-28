"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('Auth.register');
  const c = useTranslations('Common');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    user_type: 'agriculteur',
    region: '',
    commune: '',
    experience_years: '',
    crop_types: '',
    intervention_zones: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend: Record<string, string | number | string[]> = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: formData.user_type,
        region: formData.region,
        commune: formData.commune,
      };

      if (formData.user_type === 'agriculteur') {
        dataToSend.experience_years = parseInt(formData.experience_years) || 0;
        dataToSend.crop_types = formData.crop_types.split(',').map(s => s.trim());
      } else {
        dataToSend.intervention_zones = formData.intervention_zones.split(',').map(s => s.trim());
      }

      await api.post('/auth/register', dataToSend);
      
      const loginFormData = new FormData();
      loginFormData.append('username', formData.email);
      loginFormData.append('password', formData.password);
      
      const response = await api.post('/auth/login', loginFormData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token } = response.data;
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      
      login(access_token, {
        id: payload.user_id,
        email: payload.sub,
        full_name: formData.full_name,
        user_type: payload.user_type as 'agriculteur' | 'collecteur'
      });

    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string | { msg: string }[] } } };
      console.error(error);
      let errorMessage = c('errors.general');
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg || JSON.stringify(error.response.data.detail);
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-foreground/60">
            {t('hasAccount')}{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              {t('login')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">{t('userTypeLabel')}</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
              >
                <option value="agriculteur">{t('farmer')}</option>
                <option value="collecteur">{t('collector')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{t('fullName')}</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{t('email')}</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{t('phone')}</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{t('password')}</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{c('region')}</label>
                <input
                  name="region"
                  type="text"
                  required
                  value={formData.region}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{c('commune')}</label>
                <input
                  name="commune"
                  type="text"
                  required
                  value={formData.commune}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
            </div>

            {formData.user_type === 'agriculteur' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{t('experience')}</label>
                  <input
                    name="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{t('crops')}</label>
                  <input
                    name="crop_types"
                    type="text"
                    value={formData.crop_types}
                    onChange={handleChange}
                    placeholder={t('cropsPlaceholder')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">{t('zones')}</label>
                <input
                  name="intervention_zones"
                  type="text"
                  value={formData.intervention_zones}
                  onChange={handleChange}
                  placeholder={t('zonesPlaceholder')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? c('loading') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
