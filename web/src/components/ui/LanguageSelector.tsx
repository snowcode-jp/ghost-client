'use client';

/**
 * Language Selector Component
 *
 * ダッシュボードヘッダーに表示する言語切替ドロップダウン
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages, getCurrentLanguage } from '@/i18n';

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  const currentLanguage = supportedLanguages.find(l => l.code === currentLang);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage?.nativeName || 'Language'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                <span>{lang.nativeName}</span>
                {currentLang === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
