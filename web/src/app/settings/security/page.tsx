'use client';

/**
 * Security Settings Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, SecuritySettings } from '@/lib/api';
import { Save, CheckCircle, AlertCircle, Shield, Lock, Key } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSecuritySettings();
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
      await api.updateSecuritySettings(settings);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure authentication and security policies
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

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Configure password requirements for user accounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Length"
                type="number"
                min={6}
                max={32}
                value={settings?.password_policy.min_length ?? 8}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  password_policy: { ...s.password_policy, min_length: parseInt(e.target.value) || 8 }
                } : null)}
              />
              <Input
                label="Password Max Age (days)"
                type="number"
                min={0}
                value={settings?.password_policy.max_age_days ?? 90}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  password_policy: { ...s.password_policy, max_age_days: parseInt(e.target.value) || 90 }
                } : null)}
                helperText="0 for no expiration"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.password_policy.require_uppercase ?? true}
                    onChange={(e) => setSettings(s => s ? {
                      ...s,
                      password_policy: { ...s.password_policy, require_uppercase: e.target.checked }
                    } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require uppercase letters</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.password_policy.require_lowercase ?? true}
                    onChange={(e) => setSettings(s => s ? {
                      ...s,
                      password_policy: { ...s.password_policy, require_lowercase: e.target.checked }
                    } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require lowercase letters</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.password_policy.require_numbers ?? true}
                    onChange={(e) => setSettings(s => s ? {
                      ...s,
                      password_policy: { ...s.password_policy, require_numbers: e.target.checked }
                    } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require numbers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.password_policy.require_special ?? false}
                    onChange={(e) => setSettings(s => s ? {
                      ...s,
                      password_policy: { ...s.password_policy, require_special: e.target.checked }
                    } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require special characters</span>
                </label>
              </div>
            </div>
            <Input
              label="Password History Count"
              type="number"
              min={0}
              max={24}
              value={settings?.password_policy.history_count ?? 5}
              onChange={(e) => setSettings(s => s ? {
                ...s,
                password_policy: { ...s.password_policy, history_count: parseInt(e.target.value) || 5 }
              } : null)}
              helperText="Number of previous passwords to remember (prevents reuse)"
            />
          </CardContent>
        </Card>

        {/* Login Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Login Settings</CardTitle>
                <CardDescription>Configure login behavior and lockout policies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Login Attempts"
                type="number"
                min={1}
                max={10}
                value={settings?.login_settings.max_attempts ?? 5}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  login_settings: { ...s.login_settings, max_attempts: parseInt(e.target.value) || 5 }
                } : null)}
              />
              <Input
                label="Lockout Duration (minutes)"
                type="number"
                min={1}
                value={settings?.login_settings.lockout_duration_mins ?? 30}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  login_settings: { ...s.login_settings, lockout_duration_mins: parseInt(e.target.value) || 30 }
                } : null)}
              />
            </div>
            <Input
              label="Session Timeout (minutes)"
              type="number"
              min={5}
              value={settings?.login_settings.session_timeout_mins ?? 60}
              onChange={(e) => setSettings(s => s ? {
                ...s,
                login_settings: { ...s.login_settings, session_timeout_mins: parseInt(e.target.value) || 60 }
              } : null)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings?.login_settings.single_session ?? false}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  login_settings: { ...s.login_settings, single_session: e.target.checked }
                } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Single session only (logout other sessions on new login)
              </span>
            </label>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Configure 2FA requirements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings?.two_factor.enabled ?? false}
                onChange={(e) => setSettings(s => s ? {
                  ...s,
                  two_factor: { ...s.two_factor, enabled: e.target.checked }
                } : null)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable two-factor authentication</span>
            </label>

            {settings?.two_factor.enabled && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.two_factor.required_for_admins ?? true}
                    onChange={(e) => setSettings(s => s ? {
                      ...s,
                      two_factor: { ...s.two_factor, required_for_admins: e.target.checked }
                    } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require 2FA for administrators</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed 2FA Methods
                  </label>
                  <div className="space-y-2">
                    {['totp', 'sms', 'email'].map((method) => (
                      <label key={method} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings?.two_factor.allowed_methods.includes(method) ?? false}
                          onChange={(e) => {
                            if (!settings) return;
                            const methods = e.target.checked
                              ? [...settings.two_factor.allowed_methods, method]
                              : settings.two_factor.allowed_methods.filter(m => m !== method);
                            setSettings({
                              ...settings,
                              two_factor: { ...settings.two_factor, allowed_methods: methods }
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {method === 'totp' ? 'TOTP (Authenticator App)' : method.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* IP Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist</CardTitle>
            <CardDescription>Restrict access to specific IP addresses (leave empty to allow all)</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              label="Allowed IP Addresses (comma-separated)"
              value={settings?.ip_whitelist.join(', ') ?? ''}
              onChange={(e) => setSettings(s => s ? {
                ...s,
                ip_whitelist: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
              } : null)}
              placeholder="192.168.1.0/24, 10.0.0.1"
              helperText="Supports individual IPs and CIDR notation"
            />
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
