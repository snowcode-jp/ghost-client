'use client';

/**
 * Client Detail Page
 *
 * クライアント詳細ページ - パッケージ、サービス、ユーザー、SSH攻撃情報
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Server,
  Package,
  Activity,
  Users,
  Shield,
  Globe,
  Terminal,
  ArrowLeft,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Mail,
  Key,
} from 'lucide-react';
import Link from 'next/link';

// Tab types
type TabType = 'overview' | 'packages' | 'services' | 'users' | 'ssh' | 'webapps' | 'mail';

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  installed_at: string;
  auto_update: boolean;
}

interface ServiceInfo {
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'failed';
  enabled: boolean;
  pid?: number;
  memory_usage?: string;
  cpu_usage?: string;
}

interface UserInfo {
  username: string;
  uid: number;
  gid: number;
  home_dir: string;
  shell: string;
  last_login?: string;
  is_system: boolean;
  groups: string[];
}

interface SSHAttempt {
  timestamp: string;
  ip_address: string;
  username: string;
  status: 'success' | 'failed' | 'blocked';
  country?: string;
  attempts_count: number;
}

interface WebApp {
  name: string;
  url: string;
  port: number;
  service: string;
  status: 'running' | 'stopped' | 'error';
  ssl: boolean;
}

interface MailUser {
  email: string;
  username: string;
  domain: string;
  quota: string;
  used: string;
  last_login?: string;
  status: 'active' | 'disabled';
  mailbox_type: 'postfix' | 'dovecot';
}

// Mock data
const mockPackages: PackageInfo[] = [
  { name: 'nginx', version: '1.24.0', description: 'High performance web server', installed_at: '2024-01-15', auto_update: true },
  { name: 'postgresql-15', version: '15.4', description: 'PostgreSQL database server', installed_at: '2024-01-15', auto_update: false },
  { name: 'redis-server', version: '7.2.3', description: 'In-memory data structure store', installed_at: '2024-02-01', auto_update: true },
  { name: 'nodejs', version: '20.10.0', description: 'JavaScript runtime', installed_at: '2024-01-20', auto_update: true },
  { name: 'python3', version: '3.11.6', description: 'Python programming language', installed_at: '2024-01-15', auto_update: false },
];

const mockServices: ServiceInfo[] = [
  { name: 'nginx', description: 'A high performance web server', status: 'running', enabled: true, pid: 1234, memory_usage: '45MB', cpu_usage: '0.2%' },
  { name: 'postgresql', description: 'PostgreSQL RDBMS', status: 'running', enabled: true, pid: 2345, memory_usage: '256MB', cpu_usage: '1.5%' },
  { name: 'redis-server', description: 'Redis Server', status: 'running', enabled: true, pid: 3456, memory_usage: '128MB', cpu_usage: '0.5%' },
  { name: 'sshd', description: 'OpenSSH server daemon', status: 'running', enabled: true, pid: 4567, memory_usage: '12MB', cpu_usage: '0.1%' },
  { name: 'postfix', description: 'Postfix Mail Transport Agent', status: 'stopped', enabled: false },
];

const mockUsers: UserInfo[] = [
  { username: 'root', uid: 0, gid: 0, home_dir: '/root', shell: '/bin/bash', last_login: '2025-02-04T08:00:00Z', is_system: true, groups: ['root'] },
  { username: 'admin', uid: 1000, gid: 1000, home_dir: '/home/admin', shell: '/bin/bash', last_login: '2025-02-04T09:00:00Z', is_system: false, groups: ['admin', 'sudo', 'docker'] },
  { username: 'deploy', uid: 1001, gid: 1001, home_dir: '/home/deploy', shell: '/bin/bash', last_login: '2025-02-03T15:30:00Z', is_system: false, groups: ['deploy', 'www-data'] },
  { username: 'postgres', uid: 999, gid: 999, home_dir: '/var/lib/postgresql', shell: '/usr/sbin/nologin', is_system: true, groups: ['postgres'] },
  { username: 'www-data', uid: 33, gid: 33, home_dir: '/var/www', shell: '/usr/sbin/nologin', is_system: true, groups: ['www-data'] },
];

const mockSSHAttempts: SSHAttempt[] = [
  { timestamp: '2025-02-04T09:30:00Z', ip_address: '192.168.1.100', username: 'admin', status: 'success', country: 'JP', attempts_count: 1 },
  { timestamp: '2025-02-04T09:15:00Z', ip_address: '45.33.32.156', username: 'root', status: 'blocked', country: 'CN', attempts_count: 50 },
  { timestamp: '2025-02-04T08:45:00Z', ip_address: '185.220.101.34', username: 'admin', status: 'failed', country: 'RU', attempts_count: 15 },
  { timestamp: '2025-02-04T08:30:00Z', ip_address: '192.168.1.50', username: 'deploy', status: 'success', country: 'JP', attempts_count: 1 },
  { timestamp: '2025-02-04T07:00:00Z', ip_address: '94.102.49.190', username: 'test', status: 'blocked', country: 'NL', attempts_count: 100 },
];

const mockWebApps: WebApp[] = [
  { name: 'Main Website', url: 'https://example.com', port: 443, service: 'nginx', status: 'running', ssl: true },
  { name: 'API Server', url: 'https://api.example.com', port: 8080, service: 'nodejs', status: 'running', ssl: true },
  { name: 'Admin Panel', url: 'https://admin.example.com', port: 3000, service: 'nginx', status: 'running', ssl: true },
  { name: 'Staging', url: 'http://staging.example.com', port: 8081, service: 'nginx', status: 'stopped', ssl: false },
];

const mockMailUsers: MailUser[] = [
  { email: 'admin@example.com', username: 'admin', domain: 'example.com', quota: '5GB', used: '1.2GB', last_login: '2025-02-04T08:00:00Z', status: 'active', mailbox_type: 'postfix' },
  { email: 'info@example.com', username: 'info', domain: 'example.com', quota: '2GB', used: '500MB', last_login: '2025-02-03T15:30:00Z', status: 'active', mailbox_type: 'postfix' },
  { email: 'support@example.com', username: 'support', domain: 'example.com', quota: '3GB', used: '2.1GB', last_login: '2025-02-04T09:00:00Z', status: 'active', mailbox_type: 'dovecot' },
  { email: 'noreply@example.com', username: 'noreply', domain: 'example.com', quota: '1GB', used: '100MB', status: 'active', mailbox_type: 'postfix' },
  { email: 'old@example.com', username: 'old', domain: 'example.com', quota: '1GB', used: '800MB', last_login: '2024-12-01T10:00:00Z', status: 'disabled', mailbox_type: 'dovecot' },
];

export default function ClientDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const tabs: { key: TabType; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', labelKey: 'clients.tabs.overview', icon: Server },
    { key: 'packages', labelKey: 'clients.tabs.packages', icon: Package },
    { key: 'services', labelKey: 'clients.tabs.services', icon: Activity },
    { key: 'users', labelKey: 'clients.tabs.users', icon: Users },
    { key: 'ssh', labelKey: 'clients.tabs.ssh', icon: Terminal },
    { key: 'webapps', labelKey: 'clients.tabs.webapps', icon: Globe },
    { key: 'mail', labelKey: 'clients.tabs.mail', icon: Mail },
  ];

  const getServiceStatusColor = (status: ServiceInfo['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-100 dark:bg-green-900/50';
      case 'stopped':
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
      case 'failed':
        return 'text-red-500 bg-red-100 dark:bg-red-900/50';
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Production Server 1
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              prod-srv-01 • 192.168.1.10 • Ubuntu 22.04 LTS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 rounded-full">
              {t('clients.statusOnline')}
            </span>
            <button
              onClick={() => setIsLoading(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockPackages.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.installedPackages')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockServices.filter(s => s.status === 'running').length}/{mockServices.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.activeServices')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockUsers.filter(u => !u.is_system).length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.systemUsers')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockSSHAttempts.filter(a => a.status === 'blocked').length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('clients.blockedAttacks')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('packages.name')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('packages.version')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('packages.description')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('packages.installedAt')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('packages.autoUpdate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPackages.map((pkg, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{pkg.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{pkg.version}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{pkg.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{pkg.installed_at}</td>
                      <td className="px-4 py-3">
                        {pkg.auto_update ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.name')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.status')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.enabled')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.pid')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.memory')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('services.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockServices.map((service, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceStatusColor(service.status)}`}>
                          {t(`services.status${service.status.charAt(0).toUpperCase() + service.status.slice(1)}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {service.enabled ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">
                        {service.pid || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {service.memory_usage || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {service.status === 'running' ? (
                            <button className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded" title={t('services.stop')}>
                              <Square className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded" title={t('services.start')}>
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded" title={t('services.restart')}>
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.username')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.uid')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.homeDir')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.shell')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.groups')}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('osUsers.lastLogin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                          {user.is_system && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              {t('osUsers.systemUser')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{user.uid}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{user.home_dir}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{user.shell}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.groups.map((group, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded">
                              {group}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {user.last_login ? formatDate(user.last_login) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SSH Tab */}
          {activeTab === 'ssh' && (
            <div className="space-y-4">
              {/* SSH Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockSSHAttempts.filter(a => a.status === 'success').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('ssh.successfulLogins')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockSSHAttempts.filter(a => a.status === 'failed').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('ssh.failedAttempts')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockSSHAttempts.filter(a => a.status === 'blocked').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('ssh.blockedIPs')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SSH Attempts Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.timestamp')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.ipAddress')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.username')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.country')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.attempts')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ssh.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSSHAttempts.map((attempt, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(attempt.timestamp)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">
                          {attempt.ip_address}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {attempt.username}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {attempt.country || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {attempt.attempts_count}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSSHStatusColor(attempt.status)}`}>
                            {t(`ssh.status${attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Web Apps Tab */}
          {activeTab === 'webapps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockWebApps.map((app, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          {app.url}
                        </a>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === 'running' ? 'text-green-500 bg-green-100 dark:bg-green-900/50' :
                      app.status === 'stopped' ? 'text-gray-500 bg-gray-100 dark:bg-gray-700' :
                      'text-red-500 bg-red-100 dark:bg-red-900/50'
                    }`}>
                      {t(`webapps.status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('webapps.port')}</span>
                      <span className="font-mono text-gray-900 dark:text-white">{app.port}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('webapps.service')}</span>
                      <span className="text-gray-900 dark:text-white">{app.service}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('webapps.ssl')}</span>
                      {app.ssl ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mail Users Tab */}
          {activeTab === 'mail' && (
            <div className="space-y-4">
              {/* Mail Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockMailUsers.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('mailUsers.totalUsers')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockMailUsers.filter(u => u.status === 'active').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('mailUsers.activeUsers')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockMailUsers.filter(u => u.status === 'disabled').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('mailUsers.disabledUsers')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mail Users Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('mailUsers.email')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('mailUsers.mailbox')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('mailUsers.quota')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('mailUsers.used')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('mailUsers.lastLogin')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMailUsers.map((user, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            user.mailbox_type === 'postfix'
                              ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                              : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                          }`}>
                            {user.mailbox_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {user.quota}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {user.used}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {user.last_login ? formatDate(user.last_login) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active'
                              ? 'text-green-500 bg-green-100 dark:bg-green-900/50'
                              : 'text-gray-500 bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {t(`mailUsers.status${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
