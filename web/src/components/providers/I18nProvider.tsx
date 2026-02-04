'use client';

/**
 * I18n Provider
 *
 * i18nextの初期化とプロバイダー
 */

import React, { useEffect, useState } from 'react';
import '@/i18n'; // i18n設定をインポート

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみi18nを初期化
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // SSR時はnullを返す
  }

  return <>{children}</>;
};
