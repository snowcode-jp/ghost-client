'use client';

/**
 * Dashboard Page
 */

import { useEffect, useState } from 'react';
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
} from 'lucide-react';

interface DashboardStats {
  metrics: SecurityMetrics | null;
  summary: MetricsSummary | null;
  alertCount: AlertCount | null;
}

export default function DashboardPage() {
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time security monitoring and threat detection
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={stats.metrics?.total_events ?? 0}
            icon={Activity}
            color="bg-blue-500"
          />
          <StatCard
            title="Attacks Blocked"
            value={stats.metrics?.attacks_blocked ?? 0}
            icon={Shield}
            color="bg-green-500"
          />
          <StatCard
            title="Anomalies Detected"
            value={stats.metrics?.anomalies_detected ?? 0}
            icon={AlertTriangle}
            color="bg-yellow-500"
          />
          <StatCard
            title="Active Alerts"
            value={stats.alertCount?.unacknowledged ?? 0}
            icon={Bell}
            color="bg-red-500"
          />
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Critical</span>
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
              <CardTitle>Attack Types</CardTitle>
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
                      No attacks detected
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/alerts"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Bell className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  View Alerts
                </p>
              </a>
              <a
                href="/rules"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Shield className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Detection Rules
                </p>
              </a>
              <a
                href="/reports"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <Activity className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Generate Report
                </p>
              </a>
              <a
                href="/settings/system"
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
              >
                <AlertTriangle className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Settings
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
