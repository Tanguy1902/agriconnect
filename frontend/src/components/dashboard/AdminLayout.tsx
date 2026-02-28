"use client";

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth, User } from '@/context/AuthContext';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faSignOutAlt,
  faBell,
  faBars,
  faTimes,
  faEnvelope,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NotificationBell from './NotificationBell';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface NavItem {
  name: string;
  href: string;
  icon: IconDefinition;
  badgeCount?: number;
}

interface SidebarContentProps {
  navItems: NavItem[];
  pathname: string;
  user: User;
  logout: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const SidebarContent = ({ navItems, pathname, user, logout, setIsMobileMenuOpen }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-primary">AgriConnect</h2>
        <p className="text-xs text-foreground/60 mt-1 font-medium uppercase tracking-wider">
          Espace Administrateur
        </p>
      </div>
      <div className="md:hidden">
        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground/60 hover:text-primary">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
    
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            pathname === item.href
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${pathname === item.href ? 'text-white' : ''}`} />
            {item.name}
          </div>
          {item.badgeCount && item.badgeCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-sm">
              {item.badgeCount > 99 ? '99+' : item.badgeCount}
            </span>
          )}
        </Link>
      ))}
    </nav>

    <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
      <div className="flex items-center gap-3 mb-4 p-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/10 overflow-hidden relative">
          {user.profile_picture ? (
            <Image 
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture}`} 
              alt={user.full_name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            user.full_name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
          <p className="text-xs text-foreground/50 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadCounts = async () => {
    try {
      const [msgRes, notifRes] = await Promise.all([
        api.get('/chats/unread-count'),
        api.get('/notifications/unread-count')
      ]);
      setUnreadMessages(msgRes.data.count);
      setUnreadNotifications(notifRes.data.count);
    } catch (err) {
      console.error("Failed to fetch unread counts", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user && user.user_type === 'admin') {
      setTimeout(() => fetchUnreadCounts(), 0);
      interval = setInterval(fetchUnreadCounts, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (user && user.user_type === 'admin') {
      setTimeout(() => fetchUnreadCounts(), 0);
    }
  }, [pathname, user]);

  if (!user || user.user_type !== 'admin') {
    return null;
  }

  const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard/admin', icon: faHome },
    { name: 'Utilisateurs', href: '/dashboard/admin/users', icon: faUsers },
    { name: 'Communauté', href: '/dashboard/community', icon: faUsers },
    { name: 'Messages', href: '/dashboard/chat', icon: faEnvelope, badgeCount: unreadMessages },
    { name: 'Notifications', href: '/dashboard/notifications', icon: faBell, badgeCount: unreadNotifications },
    { name: 'Mon Profil', href: '/profile', icon: faUser },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-foreground/60 hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
          <h1 className="font-bold text-primary text-lg">AgriConnect</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden relative">
            {user.profile_picture ? (
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture}`} 
                alt={user.full_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              user.full_name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:block sticky top-0 h-screen">
        <SidebarContent 
          navItems={navItems} 
          pathname={pathname} 
          user={user} 
          logout={logout} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out">
            <SidebarContent 
              navItems={navItems} 
              pathname={pathname} 
              user={user} 
              logout={logout} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
