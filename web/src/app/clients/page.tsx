'use client';

/**
 * Clients List Page
 *
 * クライアント一覧ページ - 監視対象のクライアント端末一覧
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Monitor,
  Server,
  Wifi,
  WifiOff,
  Plus,
  Search,
  MoreVertical,
  Package,
  Activity,
  Users,
  Shield,
  Globe,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  hostname: string;
  ip_address: string;
  os: string;
  status: 'online' | 'offline' | 'warning';
  last_seen: string;
  packages_count: number;
  services_count: number;
  users_count: number;
  alerts_count: number;
}

// Mock data - will be replaced with API calls
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Production Server 1',
    hostname: 'prod-srv-01',
    ip_address: '192.168.1.10',
    os: 'Ubuntu 22.04 LTS',
    status: 'online',
    last_seen: '2025-02-04T09:30:00Z',
    packages_count: 342,
    services_count: 45,
    users_count: 8,
    alerts_count: 2,
  },
  {
    id: '2',
    name: 'Web Server',
    hostname: 'web-srv-01',
    ip_address: '192.168.1.11',
    os: 'CentOS 8',
    status: 'online',
    last_seen: '2025-02-04T09:29:00Z',
    packages_count: 256,
    services_count: 32,
    users_count: 5,
    alerts_count: 0,
  },
  {
    id: '3',
    name: 'Database Server',
    hostname: 'db-srv-01',
    ip_address: '192.168.1.12',
    os: 'Debian 11',
    status: 'warning',
    last_seen: '2025-02-04T09:25:00Z',
    packages_count: 198,
    services_count: 28,
    users_count: 3,
    alerts_count: 5,
  },
  {
    id: '4',
    name: 'Mail Server',
    hostname: 'mail-srv-01',
    ip_address: '192.168.1.13',
    os: 'Ubuntu 20.04 LTS',
    status: 'offline',
    last_seen: '2025-02-04T08:00:00Z',
    packages_count: 178,
    services_count: 22,
    users_count: 4,
    alerts_count: 12,
  },
];

export default function ClientsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.ip_address.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return t('clients.justNow');
    if (minutes < 60) return t('clients.minutesAgo', { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('clients.hoursAgo', { count: hours });

    const days = Math.floor(hours / 24);
    return t('clients.daysAgo', { count: days });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const stats = {
    total: clients.length,
    online: clients.filter(c => c.status === 'online').length,
    warning: clients.filter(c => c.status === 'warning').length,
    offline: clients.filter(c => c.status === 'offline').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('clients.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('clients.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              {t('clients.addClient')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.totalClients')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.online}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.onlineClients')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.warning}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.warningClients')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.offline}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.offlineClients')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('clients.allStatus')}</option>
            <option value="online">{t('clients.statusOnline')}</option>
            <option value="warning">{t('clients.statusWarning')}</option>
            <option value="offline">{t('clients.statusOffline')}</option>
          </select>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Server className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {client.hostname}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`} />
                  {getStatusIcon(client.status)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('clients.ipAddress')}</span>
                  <span className="font-mono">{client.ip_address}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('clients.operatingSystem')}</span>
                  <span>{client.os}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('clients.lastSeen')}</span>
                  <span>{formatLastSeen(client.last_seen)}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {client.packages_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('clients.packages')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-500 mr-1" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {client.services_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('clients.services')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {client.users_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('clients.users')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-500 mr-1" />
                    <span className={`font-semibold ${client.alerts_count > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {client.alerts_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('clients.alerts')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('clients.noClientsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('clients.noClientsDescription')}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
