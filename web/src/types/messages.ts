/**
 * Ghost Message Types
 *
 * Type definitions for the message code system
 */

/** Message severity levels */
export type MessageSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success';

/** Message level prefixes */
export type MessageLevel = 'E' | 'W' | 'I' | 'S' | 'D';

/** Supported languages */
export type SupportedLanguage = 'en' | 'ja' | 'zh' | 'ko' | 'de' | 'pt';

/** Localized message content */
export interface LocalizedMessage {
  title: string;
  message: string;
  action: string | null;
  severity?: MessageSeverity;
}

/** Message entry with all language versions */
export interface MessageEntry {
  en: LocalizedMessage;
  ja: LocalizedMessage;
  zh?: LocalizedMessage;
  ko?: LocalizedMessage;
  de?: LocalizedMessage;
  pt?: LocalizedMessage;
}

/** Message collection (code -> entry) */
export interface MessageCollection {
  _meta?: {
    version: string;
    description: string;
    lastUpdated: string;
  };
  [code: string]: MessageEntry | { version: string; description: string; lastUpdated: string };
}

/** Parsed message code structure */
export interface ParsedMessageCode {
  level: MessageLevel;
  levelName: string;
  category: string;
  categoryName: string;
  module: string;
  moduleName: string;
  sequence: string;
  fullCode: string;
}

/** Message display data */
export interface MessageDisplayData extends LocalizedMessage {
  code: string;
  parsed: ParsedMessageCode;
}

/** Category information */
export interface CategoryInfo {
  code: string;
  name: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
}

/** Module information */
export interface ModuleInfo {
  code: string;
  name: {
    en: string;
    ja: string;
  };
}
