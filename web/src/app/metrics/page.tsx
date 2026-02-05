'use client';

/**
 * Metrics Page
 *
 * メトリクス監視ページ - セキュリティメトリクス表示
 * APIからSecurityMetricsを取得して表示
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Server,
} from 'lucide-react';
import { api, SecurityMetrics, MetricsSummary, AgentInfo, ServiceWithAgent } from '@/lib/api';

export default function MetricsPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [services, setServices] = useState<ServiceWithAgent[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, summaryData, agentsData, servicesData] = await Promise.all([
        api.getMetrics(),
        api.getMetricsSummary(),
        api.getAgents(),
        api.getAllServices(),
      ]);
      setMetrics(metricsData);
      setSummary(summaryData);
      setAgents(agentsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 30秒ごとに更新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  // エージェントのステータス統計
  const agentStats = {
    total: agents.length,
    online: agents.filter(a => a.status === 'online').length,
    warning: agents.filter(a => a.status === 'warning').length,
    offline: agents.filter(a => a.status === 'offline').length,
  };

  // サービスのステータス統計
  const serviceStats = {
    total: services.length,
    running: services.filter(s => s.service.status === 'running').length,
    stopped: services.filter(s => s.service.status === 'stopped').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('metrics.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('metrics.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">{t('metrics.lastHour')}</option>
              <option value="6h">{t('metrics.last6Hours')}</option>
              <option value="24h">{t('metrics.last24Hours')}</option>
              <option value="7d">{t('metrics.last7Days')}</option>
              <option value="30d">{t('metrics.last30Days')}</option>
            </select>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && !metrics ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Security Metrics Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.total_events ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalEvents')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.attacks_blocked ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.attacksBlocked')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.anomalies_detected ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.anomaliesDetected')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics?.active_alerts ?? 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.activeAlerts')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent & Service Status */}
            <div className="grid grid-cols-2 gap-6">
              {/* Agents Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {t('clients.title')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('clients.totalClients')}</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{agentStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('clients.onlineClients')}</span>
                    <span className="text-xl font-bold text-green-600">{agentStats.online}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('clients.warningClients')}</span>
                    <span className="text-xl font-bold text-yellow-600">{agentStats.warning}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('clients.offlineClients')}</span>
                    <span className="text-xl font-bold text-red-600">{agentStats.offline}</span>
                  </div>

                  {/* Progress Bar */}
                  {agentStats.total > 0 && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${(agentStats.online / agentStats.total) * 100}%` }}
                        />
                        <div
                          className="bg-yellow-500 h-full"
                          style={{ width: `${(agentStats.warning / agentStats.total) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(agentStats.offline / agentStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t('dashboard.serviceStatus')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">合計サービス</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{serviceStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('service.running')}</span>
                    <span className="text-xl font-bold text-green-600">{serviceStats.running}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('service.stopped')}</span>
                    <span className="text-xl font-bold text-red-600">{serviceStats.stopped}</span>
                  </div>

                  {/* Progress Bar */}
                  {serviceStats.total > 0 && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${(serviceStats.running / serviceStats.total) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(serviceStats.stopped / serviceStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attack Types Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('dashboard.attackTypes')}
              </h3>
              {summary && summary.attack_types && Object.keys(summary.attack_types).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(summary.attack_types).map(([type, count]) => (
                    <div key={type} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {count}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('dashboard.noAttacksDetected')}
                </p>
              )}
            </div>

            {/* Services List */}
            {services.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  監視中のサービス
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((svc, index) => {
                    const bindDisplay = svc.service.bind_address === '0.0.0.0' ? t('service.global') :
                                        svc.service.bind_address === '127.0.0.1' ? t('service.local') :
                                        svc.service.bind_address || '';
                    return (
                      <div
                        key={`${svc.agent_id}-${svc.service.port}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${svc.service.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {svc.service.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Port {svc.service.port}{bindDisplay && ` • ${bindDisplay}`}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          svc.service.status === 'running'
                            ? 'text-green-500 bg-green-100 dark:bg-green-900/50'
                            : 'text-red-500 bg-red-100 dark:bg-red-900/50'
                        }`}>
                          {svc.service.status === 'running' ? t('service.running') : t('service.stopped')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
