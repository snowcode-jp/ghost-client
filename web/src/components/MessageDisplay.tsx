/**
 * Ghost Message Display Components
 *
 * Reusable components for displaying messages throughout the application
 */

import React from 'react';
import { useMessage } from '../hooks/useMessages';
import { getLevelColor, getSeverityColor } from '../i18n/messageParser';
import type { SupportedLanguage } from '../types/messages';

interface MessageToastProps {
  code: string;
  language?: SupportedLanguage;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Toast notification for displaying messages
 */
export const MessageToast: React.FC<MessageToastProps> = ({
  code,
  language,
  onDismiss,
  className = '',
}) => {
  const message = useMessage(code, language);

  if (!message) {
    return null;
  }

  const levelColor = getLevelColor(code[0] as 'E' | 'W' | 'I' | 'S' | 'D');
  const severityColor = message.severity ? getSeverityColor(message.severity) : '';

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <div className={`h-1 ${levelColor.replace('text-', 'bg-')}`} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${levelColor}`}>
              {code}
            </span>
            {message.severity && (
              <span className={`px-2 py-0.5 rounded text-xs ${severityColor}`}>
                {message.severity}
              </span>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
        <h4 className="mt-2 font-semibold text-gray-900 dark:text-white">{message.title}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message.message}</p>
        {message.action && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{message.action}</p>
        )}
      </div>
    </div>
  );
};

interface MessageBannerProps {
  code: string;
  language?: SupportedLanguage;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Banner for displaying important messages
 */
export const MessageBanner: React.FC<MessageBannerProps> = ({
  code,
  language,
  onDismiss,
  className = '',
}) => {
  const message = useMessage(code, language);

  if (!message) {
    return null;
  }

  const level = code[0] as 'E' | 'W' | 'I' | 'S' | 'D';
  const bgColors: Record<string, string> = {
    E: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    W: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    I: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    S: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    D: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200',
  };

  return (
    <div className={`border rounded-lg p-4 ${bgColors[level]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            {level === 'E' && '⚠️'}
            {level === 'W' && '⚡'}
            {level === 'I' && 'ℹ️'}
            {level === 'S' && '✅'}
            {level === 'D' && '🔧'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs opacity-75">{code}</span>
              <h4 className="font-semibold">{message.title}</h4>
            </div>
            <p className="mt-1 text-sm opacity-90">{message.message}</p>
            {message.action && <p className="mt-2 text-sm font-medium">{message.action}</p>}
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="opacity-75 hover:opacity-100">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

interface MessageInlineProps {
  code: string;
  language?: SupportedLanguage;
  showCode?: boolean;
  className?: string;
}

/**
 * Inline message display
 */
export const MessageInline: React.FC<MessageInlineProps> = ({
  code,
  language,
  showCode = true,
  className = '',
}) => {
  const message = useMessage(code, language);

  if (!message) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showCode && <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">{code}</code>}
      <span>{message.message}</span>
    </span>
  );
};

interface MessageLinkProps {
  code: string;
  language?: SupportedLanguage;
  helpPageUrl?: string;
  className?: string;
}

/**
 * Message code link to help page
 */
export const MessageLink: React.FC<MessageLinkProps> = ({
  code,
  language,
  helpPageUrl = '/help',
  className = '',
}) => {
  const message = useMessage(code, language);

  if (!message) {
    return <code className={className}>{code}</code>;
  }

  return (
    <a
      href={`${helpPageUrl}?code=${code}`}
      className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline ${className}`}
      title={message.title}
    >
      <code className="text-xs bg-blue-50 dark:bg-blue-900/30 px-1 rounded">{code}</code>
      <span className="text-sm">{message.title}</span>
    </a>
  );
};
