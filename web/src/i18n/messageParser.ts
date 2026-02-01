/**
 * Ghost Message Parser
 *
 * Parses message codes and provides metadata about each component
 */

import type {
  MessageLevel,
  ParsedMessageCode,
  CategoryInfo,
  ModuleInfo,
  SupportedLanguage,
} from '../types/messages';

/** Localized string type for 6 languages */
type LocalizedString = {
  en: string;
  ja: string;
  zh?: string;
  ko?: string;
  de?: string;
  pt?: string;
};

/** Level definitions */
export const MESSAGE_LEVELS: Record<MessageLevel, LocalizedString> = {
  E: { en: 'Error', ja: 'エラー', zh: '错误', ko: '오류', de: 'Fehler', pt: 'Erro' },
  W: { en: 'Warning', ja: '警告', zh: '警告', ko: '경고', de: 'Warnung', pt: 'Aviso' },
  I: { en: 'Info', ja: '情報', zh: '信息', ko: '정보', de: 'Info', pt: 'Info' },
  S: { en: 'Success', ja: '成功', zh: '成功', ko: '성공', de: 'Erfolg', pt: 'Sucesso' },
  D: { en: 'Debug', ja: 'デバッグ', zh: '调试', ko: '디버그', de: 'Debug', pt: 'Debug' },
};

/** Category definitions with 6 languages */
export const MESSAGE_CATEGORIES: CategoryInfo[] = [
  {
    code: '01',
    name: { en: 'Core', ja: 'コア', zh: '核心', ko: '코어', de: 'Kern', pt: 'Núcleo' },
    description: { en: 'Core system operations', ja: 'コアシステム操作' },
  },
  {
    code: '02',
    name: { en: 'API', ja: 'API', zh: 'API', ko: 'API', de: 'API', pt: 'API' },
    description: { en: 'REST API operations', ja: 'REST API操作' },
  },
  {
    code: '03',
    name: { en: 'Auth', ja: '認証', zh: '认证', ko: '인증', de: 'Auth', pt: 'Autenticação' },
    description: { en: 'Authentication & Authorization', ja: '認証・認可' },
  },
  {
    code: '04',
    name: { en: 'Storage', ja: 'ストレージ', zh: '存储', ko: '스토리지', de: 'Speicher', pt: 'Armazenamento' },
    description: { en: 'Database & storage operations', ja: 'データベース・ストレージ操作' },
  },
  {
    code: '05',
    name: { en: 'Agent', ja: 'エージェント', zh: '代理', ko: '에이전트', de: 'Agent', pt: 'Agente' },
    description: { en: 'Endpoint agent operations', ja: 'エンドポイントエージェント操作' },
  },
  {
    code: '06',
    name: { en: 'Detection', ja: '検出', zh: '检测', ko: '탐지', de: 'Erkennung', pt: 'Detecção' },
    description: { en: 'Detection engine & rules', ja: '検出エンジン・ルール' },
  },
  {
    code: '07',
    name: { en: 'WAF', ja: 'WAF', zh: 'WAF', ko: 'WAF', de: 'WAF', pt: 'WAF' },
    description: { en: 'Web Application Firewall', ja: 'Webアプリケーションファイアウォール' },
  },
  {
    code: '08',
    name: { en: 'Scanner', ja: 'スキャナー', zh: '扫描器', ko: '스캐너', de: 'Scanner', pt: 'Scanner' },
    description: { en: 'TLS/SSL Scanner', ja: 'TLS/SSLスキャナー' },
  },
  {
    code: '09',
    name: { en: 'Intel', ja: 'インテル', zh: '情报', ko: '인텔', de: 'Intel', pt: 'Inteligência' },
    description: { en: 'Threat Intelligence', ja: '脅威インテリジェンス' },
  },
  {
    code: '10',
    name: { en: 'Notify', ja: '通知', zh: '通知', ko: '알림', de: 'Benachrichtigung', pt: 'Notificação' },
    description: { en: 'Notifications', ja: '通知' },
  },
  {
    code: '11',
    name: { en: 'Collector', ja: 'コレクター', zh: '收集器', ko: '수집기', de: 'Sammler', pt: 'Coletor' },
    description: { en: 'Log collection', ja: 'ログ収集' },
  },
  {
    code: '12',
    name: { en: 'Compliance', ja: 'コンプライアンス', zh: '合规', ko: '규정준수', de: 'Compliance', pt: 'Conformidade' },
    description: { en: 'Compliance management', ja: 'コンプライアンス管理' },
  },
  {
    code: '13',
    name: { en: 'Report', ja: 'レポート', zh: '报告', ko: '보고서', de: 'Bericht', pt: 'Relatório' },
    description: { en: 'Reporting & analytics', ja: 'レポート・分析' },
  },
  {
    code: '20',
    name: { en: 'Client', ja: 'クライアント', zh: '客户端', ko: '클라이언트', de: 'Client', pt: 'Cliente' },
    description: { en: 'Client/Dashboard operations', ja: 'クライアント・ダッシュボード操作' },
  },
  {
    code: '21',
    name: { en: 'CLI', ja: 'CLI', zh: 'CLI', ko: 'CLI', de: 'CLI', pt: 'CLI' },
    description: { en: 'Command Line Interface', ja: 'コマンドラインインターフェース' },
  },
  {
    code: '99',
    name: { en: 'General', ja: '一般', zh: '通用', ko: '일반', de: 'Allgemein', pt: 'Geral' },
    description: { en: 'General/Common messages', ja: '一般・共通メッセージ' },
  },
];

/** Module definitions by category */
export const MESSAGE_MODULES: Record<string, ModuleInfo[]> = {
  '01': [
    { code: 'A', name: { en: 'System', ja: 'システム' } },
    { code: 'B', name: { en: 'Config', ja: '設定' } },
    { code: 'C', name: { en: 'Health', ja: 'ヘルスチェック' } },
    { code: 'D', name: { en: 'Metrics', ja: 'メトリクス' } },
    { code: 'E', name: { en: 'Alert', ja: 'アラート' } },
  ],
  '02': [
    { code: 'A', name: { en: 'Server', ja: 'サーバー' } },
    { code: 'B', name: { en: 'Request', ja: 'リクエスト' } },
    { code: 'C', name: { en: 'Response', ja: 'レスポンス' } },
    { code: 'D', name: { en: 'Validation', ja: 'バリデーション' } },
    { code: 'E', name: { en: 'RateLimit', ja: 'レート制限' } },
  ],
  '03': [
    { code: 'A', name: { en: 'Login', ja: 'ログイン' } },
    { code: 'B', name: { en: 'Token', ja: 'トークン' } },
    { code: 'C', name: { en: 'Session', ja: 'セッション' } },
    { code: 'D', name: { en: 'RBAC', ja: 'ロールベースアクセス制御' } },
    { code: 'E', name: { en: 'API Key', ja: 'APIキー' } },
    { code: 'F', name: { en: 'MFA', ja: '多要素認証' } },
  ],
  '04': [
    { code: 'A', name: { en: 'SQLite', ja: 'SQLite' } },
    { code: 'B', name: { en: 'PostgreSQL', ja: 'PostgreSQL' } },
    { code: 'C', name: { en: 'ClickHouse', ja: 'ClickHouse' } },
    { code: 'D', name: { en: 'Migration', ja: 'マイグレーション' } },
    { code: 'E', name: { en: 'Query', ja: 'クエリ' } },
    { code: 'F', name: { en: 'Connection', ja: '接続' } },
  ],
  '05': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'FIM', ja: 'ファイル整合性監視' } },
    { code: 'C', name: { en: 'Process', ja: 'プロセス' } },
    { code: 'D', name: { en: 'Network', ja: 'ネットワーク' } },
    { code: 'E', name: { en: 'Rootkit', ja: 'ルートキット' } },
    { code: 'F', name: { en: 'Collector', ja: 'コレクター' } },
  ],
  '06': [
    { code: 'A', name: { en: 'Engine', ja: 'エンジン' } },
    { code: 'B', name: { en: 'Rule', ja: 'ルール' } },
    { code: 'C', name: { en: 'Sigma', ja: 'Sigma' } },
    { code: 'D', name: { en: 'Correlation', ja: '相関分析' } },
    { code: 'E', name: { en: 'MITRE', ja: 'MITRE' } },
    { code: 'F', name: { en: 'Parser', ja: 'パーサー' } },
  ],
  '07': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'SQLi', ja: 'SQLインジェクション' } },
    { code: 'C', name: { en: 'XSS', ja: 'XSS' } },
    { code: 'D', name: { en: 'RateLimit', ja: 'レート制限' } },
    { code: 'E', name: { en: 'Block', ja: 'ブロック' } },
    { code: 'F', name: { en: 'Rule', ja: 'ルール' } },
  ],
  '08': [
    { code: 'A', name: { en: 'TLS', ja: 'TLS' } },
    { code: 'B', name: { en: 'Cert', ja: '証明書' } },
    { code: 'C', name: { en: 'DNS', ja: 'DNS' } },
  ],
  '09': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'NVD', ja: 'NVD' } },
    { code: 'C', name: { en: 'AbuseIPDB', ja: 'AbuseIPDB' } },
    { code: 'D', name: { en: 'VirusTotal', ja: 'VirusTotal' } },
    { code: 'E', name: { en: 'OSV', ja: 'OSV' } },
  ],
  '10': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'Email', ja: 'メール' } },
    { code: 'C', name: { en: 'Slack', ja: 'Slack' } },
    { code: 'D', name: { en: 'Webhook', ja: 'Webhook' } },
    { code: 'E', name: { en: 'Teams', ja: 'Teams' } },
  ],
  '11': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'File', ja: 'ファイル' } },
    { code: 'C', name: { en: 'Syslog', ja: 'Syslog' } },
    { code: 'D', name: { en: 'API', ja: 'API' } },
  ],
  '12': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'SOC2', ja: 'SOC 2' } },
    { code: 'C', name: { en: 'PCIDSS', ja: 'PCI DSS' } },
    { code: 'D', name: { en: 'JSOX', ja: 'J-SOX' } },
    { code: 'E', name: { en: 'GDPR', ja: 'GDPR' } },
  ],
  '13': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'PDF', ja: 'PDF' } },
    { code: 'C', name: { en: 'Excel', ja: 'Excel' } },
    { code: 'D', name: { en: 'Dashboard', ja: 'ダッシュボード' } },
  ],
  '20': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'UI', ja: 'UI' } },
    { code: 'C', name: { en: 'Form', ja: 'フォーム' } },
    { code: 'D', name: { en: 'Chart', ja: 'チャート' } },
    { code: 'E', name: { en: 'i18n', ja: '国際化' } },
  ],
  '21': [
    { code: 'A', name: { en: 'Core', ja: 'コア' } },
    { code: 'B', name: { en: 'Command', ja: 'コマンド' } },
    { code: 'C', name: { en: 'Output', ja: '出力' } },
  ],
  '99': [
    { code: 'A', name: { en: 'Network', ja: 'ネットワーク' } },
    { code: 'B', name: { en: 'File', ja: 'ファイル' } },
    { code: 'C', name: { en: 'Validation', ja: 'バリデーション' } },
    { code: 'Z', name: { en: 'Unknown', ja: '不明' } },
  ],
};

/**
 * Parse a message code into its components
 * @param code Message code (e.g., "E03A0001")
 * @returns Parsed message code structure or null if invalid
 */
export function parseMessageCode(code: string): ParsedMessageCode | null {
  if (!code || code.length < 8) {
    return null;
  }

  const level = code[0] as MessageLevel;
  const category = code.substring(1, 3);
  const module = code[3];
  const sequence = code.substring(4);

  // Validate level
  if (!MESSAGE_LEVELS[level]) {
    return null;
  }

  // Find category info
  const categoryInfo = MESSAGE_CATEGORIES.find((c) => c.code === category);
  if (!categoryInfo) {
    return null;
  }

  // Find module info
  const modules = MESSAGE_MODULES[category] || [];
  const moduleInfo = modules.find((m) => m.code === module);

  return {
    level,
    levelName: MESSAGE_LEVELS[level].en,
    category,
    categoryName: categoryInfo.name.en,
    module,
    moduleName: moduleInfo?.name.en || 'Unknown',
    sequence,
    fullCode: code,
  };
}

/**
 * Get localized level name
 */
export function getLevelName(level: MessageLevel, lang: SupportedLanguage): string {
  return MESSAGE_LEVELS[level]?.[lang] || MESSAGE_LEVELS[level]?.en || 'Unknown';
}

/**
 * Get localized category name
 */
export function getCategoryName(category: string, lang: SupportedLanguage): string {
  const info = MESSAGE_CATEGORIES.find((c) => c.code === category);
  return info?.name[lang] || info?.name.en || 'Unknown';
}

/**
 * Get localized module name
 */
export function getModuleName(category: string, module: string, lang: SupportedLanguage): string {
  const modules = MESSAGE_MODULES[category] || [];
  const info = modules.find((m) => m.code === module);
  return info?.name[lang] || info?.name.en || 'Unknown';
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: string | undefined): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-blue-500 text-white';
    case 'info':
      return 'bg-gray-500 text-white';
    case 'success':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}

/**
 * Get level color class
 */
export function getLevelColor(level: MessageLevel): string {
  switch (level) {
    case 'E':
      return 'bg-red-500 text-white';
    case 'W':
      return 'bg-yellow-500 text-black';
    case 'I':
      return 'bg-blue-500 text-white';
    case 'S':
      return 'bg-green-500 text-white';
    case 'D':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}
