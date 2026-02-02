'use client';

/**
 * API Keys Management Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiKey } from '@/lib/api';
import { Plus, Trash2, Copy, Check, AlertCircle, Key, Ban } from 'lucide-react';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyCreated, setNewKeyCreated] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    permissions: ['read'],
    expires_in_days: 90,
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchApiKeys = async () => {
    try {
      const keys = await api.listApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const newKey = await api.createApiKey({
        name: createForm.name,
        permissions: createForm.permissions,
        expires_in_days: createForm.expires_in_days,
      });
      setNewKeyCreated(newKey);
      await fetchApiKeys();
      setCreateForm({ name: '', permissions: ['read'], expires_in_days: 90 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      await api.revokeApiKey(id);
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;

    try {
      await api.deleteApiKey(id);
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage API keys for programmatic access
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* New Key Created Modal */}
        {newKeyCreated?.key && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Key className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    API Key Created Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Copy your API key now. You won&apos;t be able to see it again.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 text-sm font-mono">
                      {newKeyCreated.key}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(newKeyCreated.key!)}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => setNewKeyCreated(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>Create a new API key for programmatic access</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Key Name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Production Integration"
                  required
                />
                <Input
                  label="Expires In (days)"
                  type="number"
                  value={createForm.expires_in_days}
                  onChange={(e) => setCreateForm({ ...createForm, expires_in_days: parseInt(e.target.value) || 90 })}
                  helperText="Set to 0 for no expiration"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['read', 'write', 'admin'].map((perm) => (
                      <label key={perm} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createForm.permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                permissions: [...createForm.permissions, perm],
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                permissions: createForm.permissions.filter((p) => p !== perm),
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {perm}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isCreating}>
                    Create Key
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Active API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No API keys created yet</p>
                <p className="text-sm mt-1">Create an API key to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className={`p-4 rounded-lg border ${
                      key.is_active
                        ? 'border-gray-200 dark:border-gray-700'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {key.name}
                          </h3>
                          {!key.is_active && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
                              Revoked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Created: {formatDate(key.created_at)}
                          {key.expires_at && ` • Expires: ${formatDate(key.expires_at)}`}
                          {key.last_used_at && ` • Last used: ${formatDate(key.last_used_at)}`}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {key.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(key.id)}
                            title="Revoke"
                          >
                            <Ban className="w-4 h-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(key.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
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
