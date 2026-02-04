'use client';

/**
 * Reports Page
 *
 * レポート管理ページ - セキュリティレポートの生成と表示
 * APIからReportを取得して表示
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Shield,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { api, Report, Recommendation } from '@/lib/api';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDailyReport();
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await fetchReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = () => {
    setShowReport(true);
  };

  const handleDownloadReport = () => {
    if (!report) return;

    // JSONとしてダウンロード
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${report.report_type}-${new Date(report.generated_at).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // JST (UTC+9) で表示
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const year = jstDate.getUTCFullYear();
    const month = (jstDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = jstDate.getUTCDate().toString().padStart(2, '0');
    const hours = jstDate.getUTCHours().toString().padStart(2, '0');
    const minutes = jstDate.getUTCMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400';
    }
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
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {t('reports.generateReport')}
          </button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : report ? (
          <>
            {/* Report Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      生成日時: {formatDate(report.generated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600">{t('reports.statusCompleted')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">期間: </span>
                  {formatDate(report.period_start)} 〜 {formatDate(report.period_end)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">タイプ: </span>
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">
                    {report.report_type === 'daily' ? '日次' : report.report_type === 'weekly' ? '週次' : report.report_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewReport}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('reports.view')}
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('reports.download')}
                </button>
              </div>
            </div>

            {/* Report Detail View */}
            {showReport && (
              <div className="space-y-6">
                {/* Metrics Summary */}
                {report.metrics_summary && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      メトリクスサマリー
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {report.metrics_summary.total_attacks}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">攻撃検知</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {report.metrics_summary.total_defenses}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">防御成功</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {report.metrics_summary.total_anomalies}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">異常検知</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {(report.metrics_summary as any).defense_rate?.toFixed(1) ?? 0}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">防御率</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alert Summary */}
                {report.alert_count && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      アラートサマリー
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {report.alert_count.total}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">合計</p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {report.alert_count.critical}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">重大</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {report.alert_count.warning}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">警告</p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {report.alert_count.unacknowledged}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">未対応</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {report.recommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      推奨事項
                    </h3>
                    <div className="space-y-4">
                      {report.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded">
                                優先度 {rec.priority}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getImpactColor(rec.impact)}`}>
                                {rec.impact === 'critical' ? '重大' : rec.impact === 'high' ? '高' : rec.impact === 'medium' ? '中' : '低'}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                [{rec.category}]
                              </span>
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {rec.description}
                          </p>
                          {rec.action_items.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">対応方法:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                {rec.action_items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    エグゼクティブサマリー
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      {report.executive_summary}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('reports.noReportsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              「レポート生成」ボタンをクリックして最新のレポートを作成してください
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
