/**
 * i18n Configuration
 *
 * 多言語対応の設定
 * - UI翻訳: locales/*.json
 * - エラーメッセージ: messages.json (client/messages.json)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';

// messages.jsonからエラーメッセージをインポート
import messagesData from '../../messages.json';

// 言語リソース
const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

// サポートする言語
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

// ブラウザの言語を検出
const detectLanguage = (): string => {
  if (typeof window === 'undefined') return 'ja';

  // LocalStorageから取得
  const stored = localStorage.getItem('ghost-language');
  if (stored && supportedLanguages.some(l => l.code === stored)) {
    return stored;
  }

  // ブラウザの言語を検出
  const browserLang = navigator.language.split('-')[0];
  if (supportedLanguages.some(l => l.code === browserLang)) {
    return browserLang;
  }

  return 'ja'; // デフォルトは日本語
};

// i18n初期化
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? detectLanguage() : 'ja',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // Reactが既にXSSを防ぐため
    },
    react: {
      useSuspense: false,
    },
  });

// 言語変更関数
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('ghost-language', lang);
  }
};

// 現在の言語を取得
export const getCurrentLanguage = (): string => {
  return i18n.language || 'ja';
};

// messages.jsonからエラーメッセージを取得
interface MessageContent {
  title: string;
  message: string;
  action: string | null;
  severity: string;
}

interface Messages {
  _meta?: {
    version: string;
    description: string;
    lastUpdated: string;
    supportedLanguages: string[];
  };
  [key: string]: { [lang: string]: MessageContent } | Messages['_meta'] | undefined;
}

const messages: Messages = messagesData as unknown as Messages;

export const getMessage = (code: string, lang?: string): MessageContent | null => {
  const currentLang = lang || getCurrentLanguage();
  const messageEntry = messages[code];

  if (!messageEntry || typeof messageEntry !== 'object') {
    return null;
  }

  // _metaをスキップ
  if ('version' in messageEntry) {
    return null;
  }

  // 指定された言語のメッセージを取得、なければ英語にフォールバック
  const langMessages = messageEntry as { [lang: string]: MessageContent };
  return langMessages[currentLang] || langMessages['en'] || null;
};

// すべてのメッセージコードを取得
export const getAllMessageCodes = (): string[] => {
  return Object.keys(messages).filter(key => key !== '_meta');
};

export default i18n;
