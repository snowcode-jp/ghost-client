'use client';

/**
 * Reports Page
 *
 * レポート管理ページ - セキュリティレポートの生成と管理
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'security' | 'compliance' | 'incident' | 'audit';
  status: 'completed' | 'generating' | 'failed' | 'scheduled';
  created_at: string;
  completed_at?: string;
  size?: string;
  period: string;
  clients: string[];
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Weekly Security Summary',
    type: 'security',
    status: 'completed',
    created_at: '2025-02-04T09:00:00Z',
    completed_at: '2025-02-04T09:05:00Z',
    size: '2.4 MB',
    period: '2025-01-28 - 2025-02-03',
    clients: ['All Clients'],
  },
  {
    id: '2',
    name: 'Monthly Compliance Report',
    type: 'compliance',
    status: 'completed',
    created_at: '2025-02-01T00:00:00Z',
    completed_at: '2025-02-01T00:15:00Z',
    size: '5.8 MB',
    period: 'January 2025',
    clients: ['All Clients'],
  },
  {
    id: '3',
    name: 'SSH Attack Analysis',
    type: 'incident',
    status: 'generating',
    created_at: '2025-02-04T09:30:00Z',
    period: '2025-02-01 - 2025-02-04',
    clients: ['prod-srv-01', 'web-srv-01'],
  },
  {
    id: '4',
    name: 'System Audit Report',
    type: 'audit',
    status: 'scheduled',
    created_at: '2025-02-04T00:00:00Z',
    period: 'Q1 2025',
    clients: ['All Clients'],
  },
  {
    id: '5',
    name: 'Daily Security Digest',
    type: 'security',
    status: 'completed',
    created_at: '2025-02-03T23:59:00Z',
    completed_at: '2025-02-04T00:02:00Z',
    size: '856 KB',
    period: '2025-02-03',
    clients: ['All Clients'],
  },
  {
    id: '6',
    name: 'Failed Login Report',
    type: 'incident',
    status: 'failed',
    created_at: '2025-02-02T10:00:00Z',
    period: '2025-01-01 - 2025-02-02',
    clients: ['db-srv-01'],
  },
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [reports] = useState<Report[]>(mockReports);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const types = ['all', 'security', 'compliance', 'incident', 'audit'];
  const statuses = ['all', 'completed', 'generating', 'scheduled', 'failed'];

  const filteredReports = reports.filter(report => {
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'security':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400';
      case 'compliance':
        return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400';
      case 'incident':
        return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
      case 'audit':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return t('reports.statusCompleted');
      case 'generating':
        return t('reports.statusGenerating');
      case 'scheduled':
        return t('reports.statusScheduled');
      case 'failed':
        return t('reports.statusFailed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    generating: reports.filter(r => r.status === 'generating').length,
    scheduled: reports.filter(r => r.status === 'scheduled').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('reports.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('reports.description')}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            {t('reports.generateReport')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.totalReports')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.completedReports')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.generating}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.generatingReports')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.scheduledReports')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? t('reports.allTypes') : t(`reports.type.${type}`)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? t('reports.allStatuses') : getStatusText(status as Report['status'])}
              </option>
            ))}
          </select>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.reportName')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.type')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.period')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.status')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.createdAt')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('reports.size')}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(report.type)}`}>
                      {t(`reports.type.${report.type}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {report.period}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(report.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {report.size || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && (
                        <>
                          <button className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded" title={t('reports.view')}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded" title={t('reports.download')}>
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {report.status === 'failed' && (
                        <button className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded" title={t('reports.retry')}>
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded" title={t('common.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('reports.noReportsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('reports.noReportsDescription')}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
