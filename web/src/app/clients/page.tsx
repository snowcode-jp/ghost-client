'use client';

/**
 * Clients List Page
 *
 * クライアント一覧ページ - 監視対象のエージェント一覧
 * APIからAgentInfoを取得して表示
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Monitor,
  Server,
  Wifi,
  WifiOff,
  Search,
  Activity,
  Shield,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { api, AgentInfo } from '@/lib/api';

export default function ClientsPage() {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // 30秒ごとに更新
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.ip_address && agent.ip_address.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: AgentInfo['status']) => {
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

  const getStatusIcon = (status: AgentInfo['status']) => {
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

  const stats = {
    total: agents.length,
    online: agents.filter(a => a.status === 'online').length,
    warning: agents.filter(a => a.status === 'warning').length,
    offline: agents.filter(a => a.status === 'offline').length,
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
              onClick={fetchAgents}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
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

        {/* Loading */}
        {isLoading && agents.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {agents.length === 0 ? t('clients.noClientsFound') : t('clients.noClientsDescription')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {agents.length === 0
                ? 'エージェントがまだ接続されていません。ghost-agentをインストールして起動してください。'
                : t('clients.noClientsDescription')}
            </p>
          </div>
        ) : (
          /* Agent Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <Link
                key={agent.agent_id}
                href={`/clients/${encodeURIComponent(agent.agent_id)}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Server className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {agent.hostname}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {agent.agent_id.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    {getStatusIcon(agent.status)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {agent.ip_address && (
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>{t('clients.ipAddress')}</span>
                      <span className="font-mono">{agent.ip_address}</span>
                    </div>
                  )}
                  {agent.version && (
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>{t('clients.agentVersion')}</span>
                      <span>{agent.version}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>{t('clients.lastSeen')}</span>
                    <span>{formatLastSeen(agent.last_seen)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status === 'online'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : agent.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {agent.status === 'online' ? t('clients.statusOnline') :
                       agent.status === 'warning' ? t('clients.statusWarning') :
                       t('clients.statusOffline')}
                    </span>
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
