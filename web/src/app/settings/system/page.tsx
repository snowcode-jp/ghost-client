'use client';

/**
 * System Settings Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, SystemSettings } from '@/lib/api';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSystemSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await api.updateSystemSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure general system settings and preferences
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            Settings saved successfully
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Server Name"
              value={settings?.server_name ?? ''}
              onChange={(e) => setSettings(s => s ? { ...s, server_name: e.target.value } : null)}
              placeholder="Ghost Security Monitor"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Timezone"
                value={settings?.timezone ?? ''}
                onChange={(e) => setSettings(s => s ? { ...s, timezone: e.target.value } : null)}
                placeholder="Asia/Tokyo"
              />
              <Input
                label="Language"
                value={settings?.language ?? ''}
                onChange={(e) => setSettings(s => s ? { ...s, language: e.target.value } : null)}
                placeholder="ja"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>Configure how long data is stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Log Retention (days)"
                type="number"
                value={settings?.log_retention_days ?? 90}
                onChange={(e) => setSettings(s => s ? { ...s, log_retention_days: parseInt(e.target.value) || 90 } : null)}
              />
              <Input
                label="Metrics Retention (days)"
                type="number"
                value={settings?.metrics_retention_days ?? 365}
                onChange={(e) => setSettings(s => s ? { ...s, metrics_retention_days: parseInt(e.target.value) || 365 } : null)}
              />
              <Input
                label="Alert Retention (days)"
                type="number"
                value={settings?.alert_retention_days ?? 180}
                onChange={(e) => setSettings(s => s ? { ...s, alert_retention_days: parseInt(e.target.value) || 180 } : null)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session & Limits</CardTitle>
            <CardDescription>Configure session and system limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Session Timeout (seconds)"
                type="number"
                value={settings?.session_timeout_secs ?? 3600}
                onChange={(e) => setSettings(s => s ? { ...s, session_timeout_secs: parseInt(e.target.value) || 3600 } : null)}
              />
              <Input
                label="Max Concurrent Users"
                type="number"
                value={settings?.max_concurrent_users ?? 100}
                onChange={(e) => setSettings(s => s ? { ...s, max_concurrent_users: parseInt(e.target.value) || 100 } : null)}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="debug_mode"
                checked={settings?.debug_mode ?? false}
                onChange={(e) => setSettings(s => s ? { ...s, debug_mode: e.target.checked } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="debug_mode" className="text-sm text-gray-700 dark:text-gray-300">
                Enable Debug Mode
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
