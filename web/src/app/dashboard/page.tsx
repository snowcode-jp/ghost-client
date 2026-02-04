'use client';

/**
 * Dashboard Page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { api, SecurityMetrics, MetricsSummary, AlertCount } from '@/lib/api';
import {
  Shield,
  AlertTriangle,
  Activity,
  Bell,
  TrendingUp,
  TrendingDown,
  Monitor,
  Wifi,
  WifiOff,
  Terminal,
  Server,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  metrics: SecurityMetrics | null;
  summary: MetricsSummary | null;
  alertCount: AlertCount | null;
}

interface ClientStatus {
  id: string;
  name: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
  ip_address: string;
  last_seen: string;
}

interface SSHAttempt {
  timestamp: string;
  source_ip: string;
  target_host: string;
  username: string;
  status: 'success' | 'failed' | 'blocked';
  country?: string;
}

// Mock data for SSH attempts
const mockSSHAttempts: SSHAttempt[] = [
  { timestamp: '2025-02-04T09:30:00Z', source_ip: '192.168.1.100', target_host: 'prod-srv-01', username: 'admin', status: 'success', country: 'JP' },
  { timestamp: '2025-02-04T09:28:00Z', source_ip: '45.33.32.156', target_host: 'web-srv-01', username: 'root', status: 'blocked', country: 'CN' },
  { timestamp: '2025-02-04T09:25:00Z', source_ip: '185.220.101.34', target_host: 'db-srv-01', username: 'admin', status: 'failed', country: 'RU' },
  { timestamp: '2025-02-04T09:22:00Z', source_ip: '192.168.1.50', target_host: 'prod-srv-01', username: 'deploy', status: 'success', country: 'JP' },
  { timestamp: '2025-02-04T09:15:00Z', source_ip: '94.102.49.190', target_host: 'web-srv-01', username: 'test', status: 'blocked', country: 'NL' },
];

// Mock data for client status
const mockClients: ClientStatus[] = [
  { id: '1', name: 'Production Server 1', hostname: 'prod-srv-01', status: 'online', ip_address: '192.168.1.10', last_seen: '2025-02-04T09:30:00Z' },
  { id: '2', name: 'Web Server', hostname: 'web-srv-01', status: 'online', ip_address: '192.168.1.11', last_seen: '2025-02-04T09:29:00Z' },
  { id: '3', name: 'Database Server', hostname: 'db-srv-01', status: 'warning', ip_address: '192.168.1.12', last_seen: '2025-02-04T09:25:00Z' },
  { id: '4', name: 'Mail Server', hostname: 'mail-srv-01', status: 'offline', ip_address: '192.168.1.13', last_seen: '2025-02-04T08:00:00Z' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    metrics: null,
    summary: null,
    alertCount: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, summary, alertCount] = await Promise.all([
          api.getMetrics(),
          api.getMetricsSummary(),
          api.getAlertCount(),
        ]);
        setStats({ metrics, summary, alertCount });
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

  const getSSHStatusColor = (status: SSHAttempt['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500 bg-green-100 dark:bg-green-900/50';
      case 'failed':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50';
      case 'blocked':
        return 'text-red-500 bg-red-100 dark:bg-red-900/50';
    }
  };

  const getClientStatusColor = (status: ClientStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        {/* SSH Attempts & Client Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent SSH Attempts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  {t('dashboard.recentSSHAttempts')}
                </CardTitle>
                <Link href="/clients" className="text-sm text-blue-500 hover:text-blue-600">
                  {t('common.all')} →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSSHAttempts.slice(0, 5).map((attempt, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
                        {formatTime(attempt.timestamp)}
                      </span>
                      <div>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {attempt.source_ip}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {attempt.username}@{attempt.target_host} {attempt.country && `(${attempt.country})`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSSHStatusColor(attempt.status)}`}>
                      {attempt.status === 'success' ? t('ssh.statusSuccess') :
                       attempt.status === 'failed' ? t('ssh.statusFailed') :
                       t('ssh.statusBlocked')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {t('dashboard.clientStatus')}
                </CardTitle>
                <Link href="/clients" className="text-sm text-blue-500 hover:text-blue-600">
                  {t('common.all')} →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${getClientStatusColor(client.status)}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.hostname}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {client.ip_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {client.status === 'online' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : client.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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
