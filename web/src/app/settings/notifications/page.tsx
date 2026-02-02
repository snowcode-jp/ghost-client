'use client';

/**
 * Notification Settings Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, NotificationSettings } from '@/lib/api';
import { Save, CheckCircle, AlertCircle, Mail, MessageSquare, Webhook } from 'lucide-react';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getNotificationSettings();
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
      await api.updateNotificationSettings(settings);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure alert notifications via email, Slack, and webhooks
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

        {/* Alert Level Threshold */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Threshold</CardTitle>
            <CardDescription>Minimum alert level to trigger notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={settings?.alert_level_threshold ?? 'warning'}
              onChange={(e) => setSettings(s => s ? { ...s, alert_level_threshold: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="info">Info (All alerts)</option>
              <option value="warning">Warning and above</option>
              <option value="critical">Critical only</option>
            </select>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Send alerts via SMTP email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email_enabled"
                checked={settings?.email.enabled ?? false}
                onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, enabled: e.target.checked } } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="email_enabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable email notifications
              </label>
            </div>

            {settings?.email.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SMTP Host"
                    value={settings?.email.smtp_host ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, smtp_host: e.target.value } } : null)}
                    placeholder="smtp.example.com"
                  />
                  <Input
                    label="SMTP Port"
                    type="number"
                    value={settings?.email.smtp_port ?? 587}
                    onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, smtp_port: parseInt(e.target.value) || 587 } } : null)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SMTP Username"
                    value={settings?.email.smtp_user ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, smtp_user: e.target.value } } : null)}
                  />
                  <Input
                    label="SMTP Password"
                    type="password"
                    value={settings?.email.smtp_password ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, smtp_password: e.target.value } } : null)}
                    placeholder="Enter password to change"
                  />
                </div>
                <Input
                  label="From Address"
                  type="email"
                  value={settings?.email.from_address ?? ''}
                  onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, from_address: e.target.value } } : null)}
                  placeholder="alerts@example.com"
                />
                <Input
                  label="Recipients (comma-separated)"
                  value={settings?.email.recipients.join(', ') ?? ''}
                  onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, recipients: e.target.value.split(',').map(r => r.trim()).filter(Boolean) } } : null)}
                  placeholder="admin@example.com, security@example.com"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="smtp_tls"
                    checked={settings?.email.smtp_tls ?? true}
                    onChange={(e) => setSettings(s => s ? { ...s, email: { ...s.email, smtp_tls: e.target.checked } } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smtp_tls" className="text-sm text-gray-700 dark:text-gray-300">
                    Use TLS encryption
                  </label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Slack Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Slack Notifications</CardTitle>
                <CardDescription>Send alerts to a Slack channel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="slack_enabled"
                checked={settings?.slack.enabled ?? false}
                onChange={(e) => setSettings(s => s ? { ...s, slack: { ...s.slack, enabled: e.target.checked } } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="slack_enabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable Slack notifications
              </label>
            </div>

            {settings?.slack.enabled && (
              <>
                <Input
                  label="Webhook URL"
                  value={settings?.slack.webhook_url ?? ''}
                  onChange={(e) => setSettings(s => s ? { ...s, slack: { ...s.slack, webhook_url: e.target.value } } : null)}
                  placeholder="https://hooks.slack.com/services/..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Channel"
                    value={settings?.slack.channel ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, slack: { ...s.slack, channel: e.target.value } } : null)}
                    placeholder="#security-alerts"
                  />
                  <Input
                    label="Bot Username"
                    value={settings?.slack.username ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, slack: { ...s.slack, username: e.target.value } } : null)}
                    placeholder="Ghost Security"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Webhook Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Custom Webhook</CardTitle>
                <CardDescription>Send alerts to a custom HTTP endpoint</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="webhook_enabled"
                checked={settings?.webhook.enabled ?? false}
                onChange={(e) => setSettings(s => s ? { ...s, webhook: { ...s.webhook, enabled: e.target.checked } } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="webhook_enabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable webhook notifications
              </label>
            </div>

            {settings?.webhook.enabled && (
              <>
                <Input
                  label="Webhook URL"
                  value={settings?.webhook.url ?? ''}
                  onChange={(e) => setSettings(s => s ? { ...s, webhook: { ...s.webhook, url: e.target.value } } : null)}
                  placeholder="https://api.example.com/webhook"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      HTTP Method
                    </label>
                    <select
                      value={settings?.webhook.method ?? 'POST'}
                      onChange={(e) => setSettings(s => s ? { ...s, webhook: { ...s.webhook, method: e.target.value } } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                  <Input
                    label="Secret (for signature)"
                    type="password"
                    value={settings?.webhook.secret ?? ''}
                    onChange={(e) => setSettings(s => s ? { ...s, webhook: { ...s.webhook, secret: e.target.value } } : null)}
                    placeholder="Optional signing secret"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
