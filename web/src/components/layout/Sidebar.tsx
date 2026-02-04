'use client';

/**
 * Sidebar Component
 *
 * 多言語対応・クライアント管理メニュー追加
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Bell,
  Shield,
  Settings,
  Users,
  Key,
  Database,
  FileText,
  Activity,
  Lock,
  LogOut,
  Monitor,
  Package,
  Server,
  Terminal,
  Globe,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'nav.clients', href: '/clients', icon: Monitor },
  { nameKey: 'nav.alerts', href: '/alerts', icon: Bell },
  { nameKey: 'nav.detectionRules', href: '/detection-rules', icon: Shield },
  { nameKey: 'nav.metrics', href: '/metrics', icon: Activity },
  { nameKey: 'nav.reports', href: '/reports', icon: FileText },
];

const adminNavigation: NavItem[] = [
  { nameKey: 'nav.users', href: '/settings/users', icon: Users, adminOnly: true },
  { nameKey: 'nav.apiKeys', href: '/settings/apikeys', icon: Key, adminOnly: true },
  { nameKey: 'nav.system', href: '/settings/system', icon: Settings, adminOnly: true },
  { nameKey: 'nav.notifications', href: '/settings/notifications', icon: Bell, adminOnly: true },
  { nameKey: 'nav.storage', href: '/settings/storage', icon: Database, adminOnly: true },
  { nameKey: 'nav.security', href: '/settings/security', icon: Lock, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.roles?.some(r => r === 'admin' || r === 'super_admin');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        {t(item.nameKey)}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Ghost</span>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Security Monitor</p>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <LanguageSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="mt-6 mb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('nav.administration')}
              </h3>
            </div>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.roles?.join(', ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
};
