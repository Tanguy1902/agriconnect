"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/dashboard/AdminLayout';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faStore, 
  faList, 
  faChartLine,
  faUserTie,
  faBoxOpen,
  faDownload
} from '@fortawesome/free-solid-svg-icons';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Stats {
  users: {
    total: number;
    farmers: number;
    collectors: number;
  };
  content: {
    offers: number;
    demands: number;
    products: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExportUsers = async () => {
    try {
      const response = await api.get('/admin/export/users', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export users", err);
    }
  };

  const handleExportStats = async () => {
    try {
      const response = await api.get('/admin/export/stats', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'platform_stats.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export stats", err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-red-600 dark:text-red-400 text-center">
          {error || "Une erreur est survenue."}
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { 
      title: "Utilisateurs Totaux", 
      value: stats.users.total, 
      icon: faUsers, 
      color: "bg-blue-500",
      subtext: `${stats.users.farmers} Agriculteurs, ${stats.users.collectors} Collecteurs`
    },
    { 
      title: "Offres de Vente", 
      value: stats.content.offers, 
      icon: faStore, 
      color: "bg-green-500",
      subtext: "Total des produits mis en vente"
    },
    { 
      title: "Demandes d'Achat", 
      value: stats.content.demands, 
      icon: faList, 
      color: "bg-orange-500",
      subtext: "Total des besoins exprimés"
    },
    { 
      title: "Produits Référencés", 
      value: stats.content.products, 
      icon: faBoxOpen, 
      color: "bg-purple-500",
      subtext: "Variétés de produits sur la plateforme"
    }
  ];

  const userData = [
    { name: 'Agriculteurs', value: stats.users.farmers, color: '#10b981' },
    { name: 'Collecteurs', value: stats.users.collectors, color: '#3b82f6' },
  ];

  const contentData = [
    { name: 'Offres', value: stats.content.offers },
    { name: 'Demandes', value: stats.content.demands },
    { name: 'Produits', value: stats.content.products },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Administrateur</h1>
          <p className="text-foreground/60 mt-2">Vue d&apos;ensemble de l&apos;activité de la plateforme AgriConnect.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                  <FontAwesomeIcon icon={card.icon} className="text-xl" />
                </div>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium">{card.title}</h3>
              <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
              <p className="text-xs text-foreground/40 mt-2">{card.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Répartition des Utilisateurs</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Activité de la Plateforme</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Actions Rapides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users" className="p-4 rounded-2xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center text-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-primary text-xl" />
              <span className="text-sm font-bold text-primary">Gérer les Utilisateurs</span>
            </Link>
            <button 
              onClick={handleExportUsers}
              className="p-4 rounded-2xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 transition-colors flex flex-col items-center text-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} className="text-blue-600 text-xl" />
              <span className="text-sm font-bold text-blue-600">Exporter Utilisateurs</span>
            </button>
            <button 
              onClick={handleExportStats}
              className="p-4 rounded-2xl border border-green-100 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 transition-colors flex flex-col items-center text-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} className="text-green-600 text-xl" />
              <span className="text-sm font-bold text-green-600">Exporter Stats</span>
            </button>
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-col items-center text-center gap-2 opacity-50 cursor-not-allowed">
              <FontAwesomeIcon icon={faBoxOpen} className="text-foreground/40 text-xl" />
              <span className="text-sm font-bold text-foreground/40">Gérer les Produits</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
