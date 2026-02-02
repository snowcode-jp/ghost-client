'use client';

/**
 * Storage Settings Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { api, StorageSettings } from '@/lib/api';
import { Database, HardDrive, Clock, Server, CheckCircle, XCircle } from 'lucide-react';

export default function StorageSettingsPage() {
  const [settings, setSettings] = useState<StorageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getStorageSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const StatusBadge = ({ connected }: { connected: boolean }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        connected
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      }`}
    >
      {connected ? (
        <>
          <CheckCircle className="w-3 h-3" />
          Connected
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3" />
          Disconnected
        </>
      )}
    </span>
  );

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Storage Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View database and storage configuration (read-only)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Primary Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-500" />
                <div>
                  <CardTitle>Primary Database</CardTitle>
                  <CardDescription>Main data storage for events and configuration</CardDescription>
                </div>
              </div>
              <StatusBadge connected={settings?.primary_db_info.connected ?? false} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {settings?.primary_db_info.db_type ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Host</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {settings?.primary_db_info.host ?? '-'}
                </p>
              </div>
              {settings?.primary_db_info.port !== 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Port</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings?.primary_db_info.port ?? '-'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {settings?.primary_db_info.database ?? '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Series Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <CardTitle>Time Series Database</CardTitle>
                  <CardDescription>High-performance storage for metrics and logs</CardDescription>
                </div>
              </div>
              {settings?.timeseries ? (
                <StatusBadge connected={settings.timeseries.enabled} />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Not configured</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {settings?.timeseries ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {settings.timeseries.db_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Host</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.timeseries.host}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Port</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.timeseries.port}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.timeseries.database}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <HardDrive className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No time series database configured</p>
                <p className="text-sm mt-1">
                  Set CLICKHOUSE_URL environment variable to enable ClickHouse
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-gray-500" />
                <div>
                  <CardTitle>Cache</CardTitle>
                  <CardDescription>In-memory cache for improved performance</CardDescription>
                </div>
              </div>
              {settings?.cache ? (
                <StatusBadge connected={settings.cache.enabled} />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Not configured</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {settings?.cache ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {settings.cache.cache_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Host</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.cache.host}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Port</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.cache.port}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Server className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No cache configured</p>
                <p className="text-sm mt-1">
                  Set REDIS_URL environment variable to enable Redis caching
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Note */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Storage configuration is managed through environment variables.
              To change database settings, update the server configuration and restart the service.
            </p>
            <ul className="mt-2 text-sm text-blue-600 dark:text-blue-400 list-disc list-inside">
              <li>DATABASE_URL - PostgreSQL connection string</li>
              <li>SQLITE_PATH - SQLite database file path</li>
              <li>CLICKHOUSE_URL - ClickHouse connection URL</li>
              <li>REDIS_URL - Redis connection URL</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
