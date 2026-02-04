'use client';

/**
 * Dashboard Page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { api, SecurityMetrics, MetricsSummary, AlertCount, ServiceWithAgent } from '@/lib/api';
import {
  Shield,
  AlertTriangle,
  Activity,
  Bell,
  TrendingUp,
  TrendingDown,
  Server,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  metrics: SecurityMetrics | null;
  summary: MetricsSummary | null;
  alertCount: AlertCount | null;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    metrics: null,
    summary: null,
    alertCount: null,
  });
  const [services, setServices] = useState<ServiceWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, summary, alertCount, servicesData] = await Promise.all([
          api.getMetrics(),
          api.getMetricsSummary(),
          api.getAlertCount(),
          api.getAllServices(),
        ]);
        setStats({ metrics, summary, alertCount });
        setServices(servicesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoading ? '-' : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-100 dark:bg-green-900/50';
      case 'stopped':
        return 'text-red-500 bg-red-100 dark:bg-red-900/50';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // JST (UTC+9) で24時間表記
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const hours = jstDate.getUTCHours().toString().padStart(2, '0');
    const minutes = jstDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('dashboard.totalEvents')}
            value={stats.metrics?.total_events ?? 0}
            icon={Activity}
            color="bg-blue-500"
          />
          <StatCard
            title={t('dashboard.attacksBlocked')}
            value={stats.metrics?.attacks_blocked ?? 0}
            icon={Shield}
            color="bg-green-500"
          />
          <StatCard
            title={t('dashboard.anomaliesDetected')}
            value={stats.metrics?.anomalies_detected ?? 0}
            icon={AlertTriangle}
            color="bg-yellow-500"
          />
          <StatCard
            title={t('dashboard.activeAlerts')}
            value={stats.alertCount?.unacknowledged ?? 0}
            icon={Bell}
            color="bg-red-500"
          />
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.alertSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboard.critical')}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                        <div
                          className="h-2 bg-red-500 rounded-full"
                          style={{
                            width: `${
                              stats.alertCount?.total
                                ? (stats.alertCount.critical / stats.alertCount.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium w-8 text-right">
                        {stats.alertCount?.critical ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Warning</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                        <div
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{
                            width: `${
                              stats.alertCount?.total
                                ? (stats.alertCount.warning / stats.alertCount.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium w-8 text-right">
                        {stats.alertCount?.warning ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Info</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              stats.alertCount?.total
                                ? (stats.alertCount.info / stats.alertCount.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium w-8 text-right">
                        {stats.alertCount?.info ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.attackTypes')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.summary?.attack_types ?? {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {count}
                      </span>
                    </div>
                  ))}
                  {Object.keys(stats.summary?.attack_types ?? {}).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('dashboard.noAttacksDetected')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services Monitoring */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {t('dashboard.serviceStatus')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : services.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('dashboard.noServicesDetected')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc, index) => {
                  // バインドアドレスの表示を整形
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceStatusColor(svc.service.status)}`}>
                        {svc.service.status === 'running' ? t('service.running') : t('service.stopped')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/alerts"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Bell className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('dashboard.viewAlerts')}
                </p>
              </Link>
              <Link
                href="/detection-rules"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Shield className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('nav.detectionRules')}
                </p>
              </Link>
              <Link
                href="/reports"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Activity className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('dashboard.generateReport')}
                </p>
              </Link>
              <Link
                href="/settings/system"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <AlertTriangle className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('dashboard.settings')}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
