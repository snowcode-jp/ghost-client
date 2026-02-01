// Ghost Security Monitor - フロントエンドアプリケーション

const API_BASE = '/api';

// ==================== ユーティリティ ====================

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'APIエラー');
        }
        return data.data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function updateElement(id, content) {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// ==================== データ更新 ====================

async function updateMetrics() {
    try {
        const summary = await apiCall('/metrics/summary');
        updateElement('attack-count', summary.total_attacks);
        updateElement('defense-count', summary.total_defenses);
        updateElement('anomaly-count', summary.total_anomalies);
        updateElement('defense-rate', `${summary.defense_rate.toFixed(1)}%`);
    } catch (error) {
        console.error('メトリクス更新失敗:', error);
    }
}

async function updateAlerts() {
    try {
        const alerts = await apiCall('/alerts');
        const count = await apiCall('/alerts/count');

        updateElement('unacknowledged-count', count.unacknowledged);

        if (alerts.length === 0) {
            setHTML('alerts-list', '<div class="empty-state">アラートはありません</div>');
            return;
        }

        const html = alerts.map(alert => `
            <div class="alert-item alert-${alert.level} fade-in">
                <div class="alert-item-content">
                    <div class="alert-item-title">${escapeHtml(alert.title)}</div>
                    <div class="alert-item-message">${escapeHtml(alert.message)}</div>
                    ${alert.description ? `<div class="alert-item-message" style="margin-top: 4px; font-style: italic;">${escapeHtml(alert.description)}</div>` : ''}
                    <div class="alert-item-meta">
                        ${formatDate(alert.created_at)} | ${alert.source || 'N/A'}
                        ${alert.acknowledged ? ' | ✓ 確認済み' : ''}
                    </div>
                </div>
                ${!alert.acknowledged ? `
                    <div class="alert-item-actions">
                        <button class="btn btn-sm" onclick="acknowledgeAlert('${alert.id}')">確認</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        setHTML('alerts-list', html);

        // 重大アラートがあればバナー表示
        const critical = alerts.filter(a => a.level === 'critical' && !a.acknowledged);
        if (critical.length > 0) {
            showAlertBanner(`${critical.length}件の重大アラートがあります`);
        }
    } catch (error) {
        console.error('アラート更新失敗:', error);
    }
}

async function updateCryptoResults() {
    try {
        const results = await apiCall('/crypto/results');

        if (results.length === 0) {
            setHTML('crypto-results', '<div class="empty-state">監査結果がありません</div>');
            return;
        }

        const html = results.map(result => {
            const scoreClass = result.security_score >= 80 ? 'high' : result.security_score >= 50 ? 'medium' : 'low';
            return `
                <div class="crypto-item fade-in">
                    <div>
                        <div class="crypto-target">${escapeHtml(result.target)}</div>
                        <div class="crypto-version">${result.tls_version} | ${result.cipher_suite}</div>
                    </div>
                    <div class="crypto-score">
                        <span class="score-badge score-${scoreClass}">${result.security_score}点</span>
                        ${result.is_secure ? '✓ 安全' : '⚠ 要改善'}
                    </div>
                </div>
            `;
        }).join('');

        setHTML('crypto-results', html);
    } catch (error) {
        console.error('暗号監査結果更新失敗:', error);
    }
}

async function updateDetectionRules() {
    try {
        const rules = await apiCall('/detector/rules');

        if (rules.length === 0) {
            setHTML('rules-list', '<div class="empty-state">ルールがありません</div>');
            return;
        }

        const html = rules.map(rule => `
            <div class="rule-item fade-in">
                <div class="rule-header">
                    <span class="rule-name">${escapeHtml(rule.name)}</span>
                    <span class="rule-status ${rule.enabled ? 'rule-enabled' : 'rule-disabled'}">
                        ${rule.enabled ? '有効' : '無効'}
                    </span>
                </div>
                <div class="rule-threshold">
                    メトリクス: ${rule.metric_name}<br>
                    警告: ${rule.threshold.warning} | 重大: ${rule.threshold.critical} | 時間窓: ${rule.threshold.time_window_secs}秒
                </div>
            </div>
        `).join('');

        setHTML('rules-list', html);
    } catch (error) {
        console.error('検知ルール更新失敗:', error);
    }
}

// ==================== アクション ====================

async function generateDemoData() {
    try {
        const result = await apiCall('/demo/generate', { method: 'POST' });
        console.log('デモデータ生成:', result);
        await refreshAll();
    } catch (error) {
        console.error('デモデータ生成失敗:', error);
    }
}

async function runDetection() {
    try {
        const alerts = await apiCall('/detector/check', { method: 'POST' });
        console.log('異常検知結果:', alerts);
        await updateAlerts();
        if (alerts.length > 0) {
            showAlertBanner(`${alerts.length}件の異常を検知しました`);
        }
    } catch (error) {
        console.error('異常検知失敗:', error);
    }
}

async function runCryptoAudit() {
    try {
        // デモ用のターゲット
        const targets = ['api.example.com', 'web.example.com', 'mail.example.com'];
        for (const target of targets) {
            await apiCall('/crypto/audit', {
                method: 'POST',
                body: JSON.stringify({ target }),
            });
        }
        await updateCryptoResults();
    } catch (error) {
        console.error('暗号監査失敗:', error);
    }
}

async function acknowledgeAlert(id) {
    try {
        await apiCall(`/alerts/${id}/acknowledge`, { method: 'POST' });
        await updateAlerts();
    } catch (error) {
        console.error('アラート確認失敗:', error);
    }
}

async function acknowledgeAll() {
    try {
        const alerts = await apiCall('/alerts?unacknowledged_only=true');
        for (const alert of alerts) {
            await apiCall(`/alerts/${alert.id}/acknowledge`, { method: 'POST' });
        }
        await updateAlerts();
        dismissBanner();
    } catch (error) {
        console.error('一括確認失敗:', error);
    }
}

async function generateReport() {
    try {
        const report = await apiCall('/report/daily');

        const html = `
            <div class="report-summary">
                <h3>${escapeHtml(report.title)}</h3>
                <div class="report-item">
                    <span>総攻撃数</span>
                    <span>${report.metrics_summary?.total_attacks || 0}</span>
                </div>
                <div class="report-item">
                    <span>総防御数</span>
                    <span>${report.metrics_summary?.total_defenses || 0}</span>
                </div>
                <div class="report-item">
                    <span>防御率</span>
                    <span>${(report.metrics_summary?.defense_rate || 100).toFixed(1)}%</span>
                </div>
                <div class="report-item">
                    <span>未対応アラート</span>
                    <span>${report.alert_count?.unacknowledged || 0}</span>
                </div>
                ${report.recommendations?.length > 0 ? `
                    <h4 style="margin-top: 16px; margin-bottom: 8px;">推奨事項</h4>
                    ${report.recommendations.slice(0, 3).map(rec => `
                        <div class="recommendation-item">
                            <div class="recommendation-title">[${rec.category}] ${escapeHtml(rec.title)}</div>
                            <div class="recommendation-desc">${escapeHtml(rec.description)}</div>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;

        setHTML('report-content', html);
    } catch (error) {
        console.error('レポート生成失敗:', error);
        setHTML('report-content', '<div class="empty-state">レポート生成に失敗しました</div>');
    }
}

async function refreshAll() {
    await Promise.all([
        updateMetrics(),
        updateAlerts(),
        updateCryptoResults(),
        updateDetectionRules(),
    ]);
    updateElement('last-updated', `最終更新: ${new Date().toLocaleTimeString('ja-JP')}`);
}

// ==================== UI ヘルパー ====================

function showAlertBanner(message) {
    const banner = document.getElementById('alert-banner');
    const text = document.getElementById('alert-banner-text');
    if (banner && text) {
        text.textContent = message;
        banner.style.display = 'flex';
        updateSystemStatus('warning');
    }
}

function dismissBanner() {
    const banner = document.getElementById('alert-banner');
    if (banner) {
        banner.style.display = 'none';
        updateSystemStatus('healthy');
    }
}

function updateSystemStatus(status) {
    const el = document.getElementById('system-status');
    if (!el) return;

    el.className = 'status-badge';
    switch (status) {
        case 'healthy':
            el.classList.add('status-healthy');
            el.textContent = '正常稼働中';
            break;
        case 'warning':
            el.classList.add('status-warning');
            el.textContent = '注意が必要';
            break;
        case 'critical':
            el.classList.add('status-critical');
            el.textContent = '要対応';
            break;
    }
}

function updateTime() {
    const now = new Date();
    updateElement('current-time', now.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 初期化 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 初期データ読み込み
    refreshAll();

    // 時刻更新
    updateTime();
    setInterval(updateTime, 1000);

    // 自動更新（30秒ごと）
    setInterval(refreshAll, 30000);

    console.log('🛡️ Ghost Security Monitor initialized');
});
