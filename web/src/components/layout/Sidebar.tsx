'use client';

/**
 * Sidebar Component
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Detection Rules', href: '/rules', icon: Shield },
  { name: 'Metrics', href: '/metrics', icon: Activity },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const adminNavigation: NavItem[] = [
  { name: 'Users', href: '/settings/users', icon: Users, adminOnly: true },
  { name: 'API Keys', href: '/settings/apikeys', icon: Key, adminOnly: true },
  { name: 'System', href: '/settings/system', icon: Settings, adminOnly: true },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell, adminOnly: true },
  { name: 'Storage', href: '/settings/storage', icon: Database, adminOnly: true },
  { name: 'Security', href: '/settings/security', icon: Lock, adminOnly: true },
];

export const Sidebar: React.FC = () => {
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
        {item.name}
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
                Administration
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
          Logout
        </button>
      </div>
    </aside>
  );
};
