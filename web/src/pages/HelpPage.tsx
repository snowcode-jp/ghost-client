/**
 * Ghost Help Page
 *
 * Displays all message codes with searchable interface
 * Supports 6 languages: English, Japanese, Chinese, Korean, German, Portuguese
 */

import React, { useState, useMemo } from 'react';
import { useMessages } from '../hooks/useMessages';
import {
  MESSAGE_LEVELS,
  MESSAGE_CATEGORIES,
  getLevelColor,
  getSeverityColor,
  getLevelName,
  getCategoryName,
  getModuleName,
} from '../i18n/messageParser';
import type { MessageLevel, SupportedLanguage, MessageDisplayData } from '../types/messages';

/** UI translations for 6 languages */
const UI_TRANSLATIONS = {
  en: {
    title: 'Message Code Reference',
    subtitle: 'Complete reference for Ghost Security Monitor error codes and warnings',
    loading: 'Loading...',
    search: 'Search',
    searchPlaceholder: 'Search codes, titles, messages...',
    level: 'Level',
    category: 'Category',
    module: 'Module',
    action: 'Action',
    all: 'All',
    totalMessages: 'Total Messages',
    errors: 'Errors',
    warnings: 'Warnings',
    info: 'Info',
    success: 'Success',
    showing: (count: number) => `Showing ${count} messages`,
    noResults: 'No messages found matching your criteria',
    codeFormat: 'Code format: [Level][Category][Module][Sequence] (e.g., E03A0001)',
  },
  ja: {
    title: 'メッセージコードリファレンス',
    subtitle: 'Ghost Security Monitorのエラーコードと警告の完全なリファレンス',
    loading: '読み込み中...',
    search: '検索',
    searchPlaceholder: 'コード、タイトル、メッセージを検索...',
    level: 'レベル',
    category: 'カテゴリ',
    module: 'モジュール',
    action: '対処法',
    all: 'すべて',
    totalMessages: '総メッセージ数',
    errors: 'エラー',
    warnings: '警告',
    info: '情報',
    success: '成功',
    showing: (count: number) => `${count} 件のメッセージを表示中`,
    noResults: '該当するメッセージが見つかりませんでした',
    codeFormat: 'メッセージコード形式: [レベル][カテゴリ][モジュール][シーケンス] (例: E03A0001)',
  },
  zh: {
    title: '消息代码参考',
    subtitle: 'Ghost安全监控器错误代码和警告的完整参考',
    loading: '加载中...',
    search: '搜索',
    searchPlaceholder: '搜索代码、标题、消息...',
    level: '级别',
    category: '类别',
    module: '模块',
    action: '操作',
    all: '全部',
    totalMessages: '消息总数',
    errors: '错误',
    warnings: '警告',
    info: '信息',
    success: '成功',
    showing: (count: number) => `显示 ${count} 条消息`,
    noResults: '没有找到符合条件的消息',
    codeFormat: '代码格式: [级别][类别][模块][序列] (例: E03A0001)',
  },
  ko: {
    title: '메시지 코드 참조',
    subtitle: 'Ghost Security Monitor 오류 코드 및 경고에 대한 완전한 참조',
    loading: '로딩 중...',
    search: '검색',
    searchPlaceholder: '코드, 제목, 메시지 검색...',
    level: '레벨',
    category: '카테고리',
    module: '모듈',
    action: '조치',
    all: '전체',
    totalMessages: '총 메시지 수',
    errors: '오류',
    warnings: '경고',
    info: '정보',
    success: '성공',
    showing: (count: number) => `${count}개 메시지 표시 중`,
    noResults: '조건에 맞는 메시지를 찾을 수 없습니다',
    codeFormat: '코드 형식: [레벨][카테고리][모듈][시퀀스] (예: E03A0001)',
  },
  de: {
    title: 'Nachrichtencode-Referenz',
    subtitle: 'Vollständige Referenz für Ghost Security Monitor Fehlercodes und Warnungen',
    loading: 'Laden...',
    search: 'Suche',
    searchPlaceholder: 'Codes, Titel, Nachrichten suchen...',
    level: 'Stufe',
    category: 'Kategorie',
    module: 'Modul',
    action: 'Aktion',
    all: 'Alle',
    totalMessages: 'Gesamtnachrichten',
    errors: 'Fehler',
    warnings: 'Warnungen',
    info: 'Info',
    success: 'Erfolg',
    showing: (count: number) => `${count} Nachrichten werden angezeigt`,
    noResults: 'Keine Nachrichten gefunden, die Ihren Kriterien entsprechen',
    codeFormat: 'Code-Format: [Stufe][Kategorie][Modul][Sequenz] (z.B., E03A0001)',
  },
  pt: {
    title: 'Referência de Código de Mensagem',
    subtitle: 'Referência completa para códigos de erro e avisos do Ghost Security Monitor',
    loading: 'Carregando...',
    search: 'Pesquisar',
    searchPlaceholder: 'Pesquisar códigos, títulos, mensagens...',
    level: 'Nível',
    category: 'Categoria',
    module: 'Módulo',
    action: 'Ação',
    all: 'Todos',
    totalMessages: 'Total de Mensagens',
    errors: 'Erros',
    warnings: 'Avisos',
    info: 'Info',
    success: 'Sucesso',
    showing: (count: number) => `Mostrando ${count} mensagens`,
    noResults: 'Nenhuma mensagem encontrada correspondente aos seus critérios',
    codeFormat: 'Formato do código: [Nível][Categoria][Módulo][Sequência] (ex: E03A0001)',
  },
};

interface MessageCardProps {
  message: MessageDisplayData;
  language: SupportedLanguage;
}

/**
 * Message card component
 */
const MessageCard: React.FC<MessageCardProps> = ({ message, language }) => {
  const [expanded, setExpanded] = useState(false);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-mono font-bold ${getLevelColor(
              message.parsed.level
            )}`}
          >
            {message.code}
          </span>
          {message.severity && (
            <span
              className={`px-2 py-1 rounded text-xs ${getSeverityColor(message.severity)}`}
            >
              {message.severity}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
        {message.title}
      </h3>

      <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
        {message.message}
      </p>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {message.action && (
            <div className="mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                {t.action}
              </span>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                {message.action}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">{t.level}</span>
              <p className="font-medium">
                {getLevelName(message.parsed.level, language)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">{t.category}</span>
              <p className="font-medium">
                {getCategoryName(message.parsed.category, language)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">{t.module}</span>
              <p className="font-medium">
                {getModuleName(message.parsed.category, message.parsed.module, language)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Help page component
 */
export const HelpPage: React.FC = () => {
  const {
    getAllMessages,
    loading,
    error,
    language,
    setLanguage,
  } = useMessages();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<MessageLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let messages = getAllMessages();

    // Apply level filter
    if (selectedLevel !== 'all') {
      messages = messages.filter((m) => m.parsed.level === selectedLevel);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      messages = messages.filter((m) => m.parsed.category === selectedCategory);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      messages = messages.filter(
        (m) =>
          m.code.toLowerCase().includes(query) ||
          m.title.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query)
      );
    }

    return messages;
  }, [getAllMessages, selectedLevel, selectedCategory, searchQuery]);

  // Group messages by category for display
  const groupedMessages = useMemo(() => {
    const groups = new Map<string, MessageDisplayData[]>();

    for (const msg of filteredMessages) {
      const category = msg.parsed.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(msg);
    }

    return groups;
  }, [filteredMessages]);

  // Statistics
  const stats = useMemo(() => {
    const all = getAllMessages();
    return {
      total: all.length,
      errors: all.filter((m) => m.parsed.level === 'E').length,
      warnings: all.filter((m) => m.parsed.level === 'W').length,
      info: all.filter((m) => m.parsed.level === 'I').length,
      success: all.filter((m) => m.parsed.level === 'S').length,
    };
  }, [getAllMessages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-500">
          <p className="text-xl">⚠️</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Language selector */}
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">简体中文</option>
                <option value="ko">한국어</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">{t.totalMessages}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.errors}</p>
            <p className="text-sm text-red-500">{t.errors}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warnings}</p>
            <p className="text-sm text-yellow-500">{t.warnings}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.info}</p>
            <p className="text-sm text-blue-500">{t.info}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.success}</p>
            <p className="text-sm text-green-500">{t.success}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.search}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Level filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.level}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as MessageLevel | 'all')}
              >
                <option value="all">{t.all}</option>
                {(Object.keys(MESSAGE_LEVELS) as MessageLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {level} - {MESSAGE_LEVELS[level][language] || MESSAGE_LEVELS[level].en}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.category}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">{t.all}</option>
                {MESSAGE_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code} - {cat.name[language] || cat.name.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t.showing(filteredMessages.length)}
        </p>

        {/* Message list by category */}
        {Array.from(groupedMessages.entries()).map(([category, messages]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                {category}
              </span>
              {getCategoryName(category, language)}
              <span className="text-sm text-gray-500 font-normal">
                ({messages.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages.map((msg) => (
                <MessageCard key={msg.code} message={msg} language={language} />
              ))}
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t.noResults}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Ghost Security Monitor - Message Code Reference</p>
            <p className="mt-1">{t.codeFormat}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpPage;
