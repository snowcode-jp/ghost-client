'use client';

/**
 * Metrics Page
 *
 * メトリクス監視ページ - システムリソース監視
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
} from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

interface ClientMetrics {
  client_id: string;
  client_name: string;
  hostname: string;
  cpu: MetricData;
  memory: MetricData;
  disk: MetricData;
  network_in: MetricData;
  network_out: MetricData;
  uptime: string;
  load_average: string;
}

const mockMetrics: ClientMetrics[] = [
  {
    client_id: '1',
    client_name: 'Production Server 1',
    hostname: 'prod-srv-01',
    cpu: { label: 'CPU', value: 45, max: 100, unit: '%', trend: 'up', trendValue: '+5%' },
    memory: { label: 'Memory', value: 6.2, max: 8, unit: 'GB', trend: 'stable', trendValue: '0%' },
    disk: { label: 'Disk', value: 120, max: 500, unit: 'GB', trend: 'up', trendValue: '+2GB' },
    network_in: { label: 'Network In', value: 125, max: 1000, unit: 'Mbps', trend: 'down', trendValue: '-10%' },
    network_out: { label: 'Network Out', value: 85, max: 1000, unit: 'Mbps', trend: 'up', trendValue: '+15%' },
    uptime: '45 days, 12:34:56',
    load_average: '0.75, 0.82, 0.91',
  },
  {
    client_id: '2',
    client_name: 'Web Server',
    hostname: 'web-srv-01',
    cpu: { label: 'CPU', value: 72, max: 100, unit: '%', trend: 'up', trendValue: '+12%' },
    memory: { label: 'Memory', value: 14.5, max: 16, unit: 'GB', trend: 'up', trendValue: '+1.2GB' },
    disk: { label: 'Disk', value: 180, max: 256, unit: 'GB', trend: 'stable', trendValue: '0%' },
    network_in: { label: 'Network In', value: 450, max: 1000, unit: 'Mbps', trend: 'up', trendValue: '+25%' },
    network_out: { label: 'Network Out', value: 320, max: 1000, unit: 'Mbps', trend: 'up', trendValue: '+18%' },
    uptime: '12 days, 08:15:42',
    load_average: '2.15, 1.98, 1.75',
  },
  {
    client_id: '3',
    client_name: 'Database Server',
    hostname: 'db-srv-01',
    cpu: { label: 'CPU', value: 28, max: 100, unit: '%', trend: 'down', trendValue: '-8%' },
    memory: { label: 'Memory', value: 28, max: 32, unit: 'GB', trend: 'stable', trendValue: '0%' },
    disk: { label: 'Disk', value: 850, max: 1000, unit: 'GB', trend: 'up', trendValue: '+5GB' },
    network_in: { label: 'Network In', value: 200, max: 1000, unit: 'Mbps', trend: 'stable', trendValue: '0%' },
    network_out: { label: 'Network Out', value: 180, max: 1000, unit: 'Mbps', trend: 'down', trendValue: '-5%' },
    uptime: '120 days, 03:45:12',
    load_average: '0.45, 0.52, 0.48',
  },
];

export default function MetricsPage() {
  const { t } = useTranslation();
  const [metrics] = useState<ClientMetrics[]>(mockMetrics);
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);

  const getProgressColor = (value: number, max: number) => {
    const percent = (value / max) * 100;
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
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

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">48%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('metrics.avgCpu')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <MemoryStick className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">72%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('metrics.avgMemory')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">58%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('metrics.avgDisk')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <Network className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2 Gbps</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('metrics.totalNetwork')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Metrics */}
        <div className="space-y-4">
          {metrics.map((client) => (
            <div
              key={client.client_id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* Client Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {client.client_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.hostname}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{t('metrics.uptime')}: {client.uptime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{t('metrics.loadAverage')}: {client.load_average}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-5 gap-4">
                {/* CPU */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('metrics.cpu')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(client.cpu.trend)}
                      <span className="text-xs text-gray-500">{client.cpu.trendValue}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getProgressColor(client.cpu.value, client.cpu.max)} rounded-full transition-all`}
                      style={{ width: `${(client.cpu.value / client.cpu.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.cpu.value}{client.cpu.unit}
                  </p>
                </div>

                {/* Memory */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('metrics.memory')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(client.memory.trend)}
                      <span className="text-xs text-gray-500">{client.memory.trendValue}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getProgressColor(client.memory.value, client.memory.max)} rounded-full transition-all`}
                      style={{ width: `${(client.memory.value / client.memory.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.memory.value}/{client.memory.max} {client.memory.unit}
                  </p>
                </div>

                {/* Disk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('metrics.disk')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(client.disk.trend)}
                      <span className="text-xs text-gray-500">{client.disk.trendValue}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getProgressColor(client.disk.value, client.disk.max)} rounded-full transition-all`}
                      style={{ width: `${(client.disk.value / client.disk.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.disk.value}/{client.disk.max} {client.disk.unit}
                  </p>
                </div>

                {/* Network In */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('metrics.networkIn')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(client.network_in.trend)}
                      <span className="text-xs text-gray-500">{client.network_in.trendValue}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(client.network_in.value / client.network_in.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.network_in.value} {client.network_in.unit}
                  </p>
                </div>

                {/* Network Out */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('metrics.networkOut')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(client.network_out.trend)}
                      <span className="text-xs text-gray-500">{client.network_out.trendValue}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${(client.network_out.value / client.network_out.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.network_out.value} {client.network_out.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
