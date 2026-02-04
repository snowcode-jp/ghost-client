'use client';

/**
 * Detection Rules Page
 *
 * 検出ルール管理ページ - セキュリティイベント検出ルールの設定
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  enabled: boolean;
  conditions: string;
  actions: string[];
  created_at: string;
  updated_at: string;
  triggered_count: number;
}

const mockRules: DetectionRule[] = [
  {
    id: '1',
    name: 'SSH Brute Force Detection',
    description: 'Detects multiple failed SSH login attempts from same IP',
    severity: 'high',
    category: 'SSH',
    enabled: true,
    conditions: 'failed_ssh_attempts > 5 within 5 minutes',
    actions: ['alert', 'block_ip'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T15:30:00Z',
    triggered_count: 156,
  },
  {
    id: '2',
    name: 'Root Login Alert',
    description: 'Alert when root user logs in via SSH',
    severity: 'critical',
    category: 'SSH',
    enabled: true,
    conditions: 'ssh_login.user == "root"',
    actions: ['alert', 'notify'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T12:00:00Z',
    triggered_count: 23,
  },
  {
    id: '3',
    name: 'New User Created',
    description: 'Detects when a new user account is created',
    severity: 'medium',
    category: 'User',
    enabled: true,
    conditions: 'event.type == "user_created"',
    actions: ['alert'],
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
    triggered_count: 8,
  },
  {
    id: '4',
    name: 'Sudo Privilege Escalation',
    description: 'Detects sudo usage by non-admin users',
    severity: 'high',
    category: 'User',
    enabled: true,
    conditions: 'event.type == "sudo" && user.groups not contains "admin"',
    actions: ['alert', 'notify'],
    created_at: '2024-01-17T14:00:00Z',
    updated_at: '2024-01-17T14:00:00Z',
    triggered_count: 45,
  },
  {
    id: '5',
    name: 'Service Stopped',
    description: 'Alert when critical service is stopped',
    severity: 'high',
    category: 'Service',
    enabled: false,
    conditions: 'service.status == "stopped" && service.name in ["nginx", "postgresql", "sshd"]',
    actions: ['alert', 'notify'],
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-02-02T16:00:00Z',
    triggered_count: 12,
  },
  {
    id: '6',
    name: 'Disk Space Warning',
    description: 'Alert when disk usage exceeds 80%',
    severity: 'medium',
    category: 'System',
    enabled: true,
    conditions: 'disk.usage_percent > 80',
    actions: ['alert'],
    created_at: '2024-01-19T08:00:00Z',
    updated_at: '2024-01-19T08:00:00Z',
    triggered_count: 34,
  },
  {
    id: '7',
    name: 'Unusual Login Time',
    description: 'Detects login attempts outside business hours',
    severity: 'low',
    category: 'SSH',
    enabled: true,
    conditions: 'ssh_login.hour < 6 || ssh_login.hour > 22',
    actions: ['alert'],
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    triggered_count: 67,
  },
];

export default function DetectionRulesPage() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<DetectionRule[]>(mockRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(mockRules.map(r => r.category)))];
  const severities = ['all', 'critical', 'high', 'medium', 'low', 'info'];

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityColor = (severity: DetectionRule['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400';
      case 'info':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSeverityIcon = (severity: DetectionRule['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const stats = {
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    critical: rules.filter(r => r.severity === 'critical').length,
    triggered: rules.reduce((sum, r) => sum + r.triggered_count, 0),
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('detectionRules.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('detectionRules.description')}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            {t('detectionRules.addRule')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('detectionRules.totalRules')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enabled}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('detectionRules.enabledRules')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.critical}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('detectionRules.criticalRules')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.triggered}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('detectionRules.triggeredTotal')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('detectionRules.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? t('detectionRules.allCategories') : cat}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {severities.map(sev => (
              <option key={sev} value={sev}>
                {sev === 'all' ? t('detectionRules.allSeverities') : t(`detectionRules.severity.${sev}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                !rule.enabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`mt-1 ${rule.enabled ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(rule.severity)}`}>
                        {getSeverityIcon(rule.severity)}
                        {t(`detectionRules.severity.${rule.severity}`)}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {rule.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{t('detectionRules.condition')}: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{rule.conditions}</code></span>
                      <span>{t('detectionRules.triggered')}: {rule.triggered_count}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('detectionRules.noRulesFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('detectionRules.noRulesDescription')}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
