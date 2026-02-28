"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/dashboard/AdminLayout';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faUserCircle,
  faEnvelope,
  faPhone,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface User {
  id: number;
  email: string;
  full_name: string;
  user_type: string;
  phone: string;
  region: string;
  is_active: boolean;
  profile_picture?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error("Failed to toggle user status", err);
      alert("Erreur lors de la modification du statut.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-foreground/60 mt-2">Activez ou désactivez les comptes utilisateurs de la plateforme.</p>
          </div>
          <div className="relative max-w-md w-full">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Rôle</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Région</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-center">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden relative">
                            {user.profile_picture ? (
                              <Image 
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture}`} 
                                alt={user.full_name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{user.full_name}</p>
                            <p className="text-xs text-foreground/40">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.user_type === 'agriculteur' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : user.user_type === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-foreground/60 flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="w-3" /> {user.email}
                          </p>
                          <p className="text-xs text-foreground/60 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} className="w-3" /> {user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/70">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary/40" />
                          {user.region || "Non spécifiée"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.is_active 
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 rounded-xl transition-all ${
                            user.is_active 
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.is_active ? "Désactiver" : "Activer"}
                        >
                          <FontAwesomeIcon icon={user.is_active ? faTimesCircle : faCheckCircle} className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-foreground/40">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
