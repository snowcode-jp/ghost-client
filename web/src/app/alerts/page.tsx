'use client';

/**
 * Alerts Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, Alert, AlertCount } from '@/lib/api';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertCount, setAlertCount] = useState<AlertCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'critical' | 'warning' | 'info'>('all');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const params: { unacknowledged_only?: boolean; min_level?: string } = {};

      if (filter === 'unacknowledged') {
        params.unacknowledged_only = true;
      } else if (filter !== 'all') {
        params.min_level = filter;
      }

      const [alertsData, countData] = await Promise.all([
        api.getAlerts(params),
        api.getAlertCount(),
      ]);
      setAlerts(alertsData);
      setAlertCount(countData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // JST (UTC+9) で24時間表記
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const month = (jstDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = jstDate.getUTCDate().toString().padStart(2, '0');
    const hours = jstDate.getUTCHours().toString().padStart(2, '0');
    const minutes = jstDate.getUTCMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Monitor and manage security alerts
            </p>
          </div>
          <Button onClick={fetchAlerts} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card
            className={`cursor-pointer transition-colors ${filter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('all')}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertCount?.total ?? 0}
              </p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-colors ${filter === 'unacknowledged' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('unacknowledged')}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {alertCount?.unacknowledged ?? 0}
              </p>
              <p className="text-sm text-gray-500">Unacknowledged</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-colors ${filter === 'critical' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('critical')}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {alertCount?.critical ?? 0}
              </p>
              <p className="text-sm text-gray-500">Critical</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-colors ${filter === 'warning' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('warning')}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {alertCount?.warning ?? 0}
              </p>
              <p className="text-sm text-gray-500">Warning</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-colors ${filter === 'info' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('info')}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {alertCount?.info ?? 0}
              </p>
              <p className="text-sm text-gray-500">Info</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' && 'All Alerts'}
              {filter === 'unacknowledged' && 'Unacknowledged Alerts'}
              {filter === 'critical' && 'Critical Alerts'}
              {filter === 'warning' && 'Warning Alerts'}
              {filter === 'info' && 'Info Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No alerts found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getLevelColor(alert.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getLevelIcon(alert.level)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h3>
                            {alert.acknowledged && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                                Acknowledged
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          {alert.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {alert.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(alert.created_at)}</span>
                            {alert.source && <span>Source: {alert.source}</span>}
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
