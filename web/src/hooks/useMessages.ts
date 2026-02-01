/**
 * Ghost Message Hook
 *
 * React hook for loading and using message codes
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  MessageCollection,
  MessageEntry,
  LocalizedMessage,
  SupportedLanguage,
  MessageDisplayData,
  MessageLevel,
} from '../types/messages';
import { parseMessageCode } from '../i18n/messageParser';

// Import messages from JSON files
import clientMessages from '../../../messages.json';

/** Message source type */
export type MessageSource = 'client' | 'server' | 'all';

interface UseMessagesOptions {
  source?: MessageSource;
  language?: SupportedLanguage;
}

interface UseMessagesResult {
  messages: Map<string, MessageEntry>;
  loading: boolean;
  error: Error | null;
  getMessage: (code: string) => LocalizedMessage | null;
  getMessageDisplay: (code: string) => MessageDisplayData | null;
  getAllMessages: () => MessageDisplayData[];
  filterByLevel: (level: MessageLevel) => MessageDisplayData[];
  filterByCategory: (category: string) => MessageDisplayData[];
  searchMessages: (query: string) => MessageDisplayData[];
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

/**
 * Hook for accessing Ghost messages
 */
export function useMessages(options: UseMessagesOptions = {}): UseMessagesResult {
  const { source = 'client' } = options;
  const [language, setLanguage] = useState<SupportedLanguage>(
    options.language || (navigator.language.startsWith('ja') ? 'ja' : 'en')
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<Map<string, MessageEntry>>(new Map());

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const messageMap = new Map<string, MessageEntry>();

        // Load client messages
        if (source === 'client' || source === 'all') {
          const clientData = clientMessages as MessageCollection;
          for (const [code, entry] of Object.entries(clientData)) {
            if (code !== '_meta' && typeof entry === 'object' && 'en' in entry) {
              messageMap.set(code, entry as MessageEntry);
            }
          }
        }

        // Load server messages if needed
        if (source === 'server' || source === 'all') {
          try {
            const response = await fetch('/api/messages');
            if (response.ok) {
              const serverData = (await response.json()) as MessageCollection;
              for (const [code, entry] of Object.entries(serverData)) {
                if (code !== '_meta' && typeof entry === 'object' && 'en' in entry) {
                  messageMap.set(code, entry as MessageEntry);
                }
              }
            }
          } catch {
            // Server messages are optional, don't fail if unavailable
            console.warn('Server messages not available');
          }
        }

        setMessages(messageMap);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load messages'));
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [source]);

  /**
   * Get a single message by code
   */
  const getMessage = useCallback(
    (code: string): LocalizedMessage | null => {
      const entry = messages.get(code);
      if (!entry) {
        return null;
      }
      return entry[language] || entry.en;
    },
    [messages, language]
  );

  /**
   * Get message with display data
   */
  const getMessageDisplay = useCallback(
    (code: string): MessageDisplayData | null => {
      const entry = messages.get(code);
      if (!entry) {
        return null;
      }

      const parsed = parseMessageCode(code);
      if (!parsed) {
        return null;
      }

      const localized = entry[language] || entry.en;

      return {
        ...localized,
        code,
        parsed,
      };
    },
    [messages, language]
  );

  /**
   * Get all messages with display data
   */
  const getAllMessages = useCallback((): MessageDisplayData[] => {
    const result: MessageDisplayData[] = [];

    messages.forEach((entry, code) => {
      const parsed = parseMessageCode(code);
      if (parsed) {
        const localized = entry[language] || entry.en;
        result.push({
          ...localized,
          code,
          parsed,
        });
      }
    });

    // Sort by code
    return result.sort((a, b) => a.code.localeCompare(b.code));
  }, [messages, language]);

  /**
   * Filter messages by level
   */
  const filterByLevel = useCallback(
    (level: MessageLevel): MessageDisplayData[] => {
      return getAllMessages().filter((msg) => msg.parsed.level === level);
    },
    [getAllMessages]
  );

  /**
   * Filter messages by category
   */
  const filterByCategory = useCallback(
    (category: string): MessageDisplayData[] => {
      return getAllMessages().filter((msg) => msg.parsed.category === category);
    },
    [getAllMessages]
  );

  /**
   * Search messages by query
   */
  const searchMessages = useCallback(
    (query: string): MessageDisplayData[] => {
      const lowerQuery = query.toLowerCase();
      return getAllMessages().filter(
        (msg) =>
          msg.code.toLowerCase().includes(lowerQuery) ||
          msg.title.toLowerCase().includes(lowerQuery) ||
          msg.message.toLowerCase().includes(lowerQuery) ||
          msg.parsed.categoryName.toLowerCase().includes(lowerQuery) ||
          msg.parsed.moduleName.toLowerCase().includes(lowerQuery)
      );
    },
    [getAllMessages]
  );

  return {
    messages,
    loading,
    error,
    getMessage,
    getMessageDisplay,
    getAllMessages,
    filterByLevel,
    filterByCategory,
    searchMessages,
    language,
    setLanguage,
  };
}

/**
 * Simple hook for getting a single message
 */
export function useMessage(code: string, lang?: SupportedLanguage): LocalizedMessage | null {
  const { getMessage, setLanguage } = useMessages();

  useEffect(() => {
    if (lang) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  return useMemo(() => getMessage(code), [getMessage, code]);
}
