/**
 * Ghost API Client
 *
 * サーバーAPIとの通信を行うクライアント
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// API Base URL (Server runs on port 6661)
// Note: Server nests all routes under /api, so we need to include /api in the base URL
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6661') + '/api';

// Token cookie names
const ACCESS_TOKEN_KEY = 'ghost_access_token';
const REFRESH_TOKEN_KEY = 'ghost_refresh_token';

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  roles: string[];
}

export interface SetupStatus {
  is_initialized: boolean;
  needs_setup: boolean;
  version: string;
}

export interface InitialSetupRequest {
  username: string;
  password: string;
  email?: string;
}

export interface InitialSetupResponse {
  success: boolean;
  user_id: string;
  message: string;
}

// Settings types
export interface SystemSettings {
  server_name: string;
  log_retention_days: number;
  metrics_retention_days: number;
  alert_retention_days: number;
  session_timeout_secs: number;
  max_concurrent_users: number;
  debug_mode: boolean;
  timezone: string;
  language: string;
}

export interface NotificationSettings {
  email: EmailSettings;
  slack: SlackSettings;
  webhook: WebhookSettings;
  alert_level_threshold: string;
}

export interface EmailSettings {
  enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password?: string;
  smtp_tls: boolean;
  from_address: string;
  recipients: string[];
}

export interface SlackSettings {
  enabled: boolean;
  webhook_url: string;
  channel: string;
  username: string;
}

export interface WebhookSettings {
  enabled: boolean;
  url: string;
  method: string;
  headers: Record<string, string>;
  secret: string;
}

export interface StorageSettings {
  primary_db_type: string;
  primary_db_info: DatabaseInfo;
  timeseries: TimeseriesSettings | null;
  cache: CacheSettings | null;
}

export interface DatabaseInfo {
  db_type: string;
  host: string;
  port: number;
  database: string;
  connected: boolean;
}

export interface TimeseriesSettings {
  enabled: boolean;
  db_type: string;
  host: string;
  port: number;
  database: string;
}

export interface CacheSettings {
  enabled: boolean;
  cache_type: string;
  host: string;
  port: number;
}

export interface RetentionPolicy {
  logs: RetentionConfig;
  metrics: RetentionConfig;
  alerts: RetentionConfig;
  audit: RetentionConfig;
}

export interface RetentionConfig {
  retention_days: number;
  compression_enabled: boolean;
  compressed_retention_days: number;
  auto_delete_enabled: boolean;
}

export interface SecuritySettings {
  password_policy: PasswordPolicy;
  login_settings: LoginSettingsConfig;
  ip_whitelist: string[];
  two_factor: TwoFactorSettings;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special: boolean;
  max_age_days: number;
  history_count: number;
}

export interface LoginSettingsConfig {
  max_attempts: number;
  lockout_duration_mins: number;
  session_timeout_mins: number;
  single_session: boolean;
}

export interface TwoFactorSettings {
  enabled: boolean;
  required_for_admins: boolean;
  allowed_methods: string[];
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  key?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expires_in_days?: number;
}

// User types
export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  roles?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  roles?: string[];
  is_active?: boolean;
}

// Metrics types
export interface SecurityMetrics {
  total_events: number;
  attacks_blocked: number;
  anomalies_detected: number;
  active_alerts: number;
}

export interface MetricsSummary {
  total_attacks: number;
  total_defenses: number;
  total_anomalies: number;
  defense_rate: number;
  current_attack_count: number;
  current_defense_count: number;
  current_anomaly_count: number;
  attack_types?: Record<string, number>;
  defense_types?: Record<string, number>;
  anomaly_types?: Record<string, number>;
}

// Alert types
export interface Alert {
  id: string;
  level: string;
  title: string;
  message: string;
  description?: string;
  source?: string;
  acknowledged: boolean;
  created_at: string;
}

// エージェント情報
export interface AgentInfo {
  agent_id: string;
  hostname: string;
  ip_address: string | null;
  status: 'online' | 'offline' | 'warning';
  last_seen: string;
  version: string | null;
}

// サービス情報
export interface ServiceInfo {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'unknown';
  protocol: string;
  bind_address: string | null;  // リッスンアドレス (0.0.0.0, 127.0.0.1, etc.)
  last_checked: string;
}

// エージェント付きサービス情報
export interface ServiceWithAgent {
  agent_id: string;
  hostname: string;
  service: ServiceInfo;
}

export interface AlertCount {
  total: number;
  info: number;
  warning: number;
  critical: number;
  unacknowledged: number;
}

// レポート関連の型
export interface Report {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  metrics_summary: MetricsSummary | null;
  alert_count: AlertCount | null;
  recommendations: Recommendation[];
  executive_summary: string;
}

export interface Recommendation {
  priority: number;
  category: string;
  title: string;
  description: string;
  action_items: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

// 検出ルール
export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  enabled: boolean;
  conditions: string;
  created_at: string;
  updated_at: string;
  triggered_count: number;
}

export interface DetectionRuleStats {
  total: number;
  enabled: number;
  critical: number;
  by_category: Record<string, number>;
}

// Create API client
class GhostApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {
          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch {
            this.clearTokens();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const accessExpires = new Date(Date.now() + expiresIn * 1000);
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Note: Using 'lax' for cross-origin API requests
    // In production with HTTPS, consider using 'none' with secure: true
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: accessExpires,
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: refreshExpires,
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
  }

  clearTokens(): void {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.client.post<ApiResponse<{ access_token: string; refresh_token: string; expires_in: number }>>('/v1/auth/refresh', {
          refresh_token: refreshToken,
        });

        if (response.data.success && response.data.data) {
          this.setTokens(
            response.data.data.access_token,
            response.data.data.refresh_token,
            response.data.data.expires_in
          );
          return response.data.data.access_token;
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ==================== Setup & Auth ====================

  async getSetupStatus(): Promise<SetupStatus> {
    const response = await this.client.get<ApiResponse<SetupStatus>>('/v1/setup/status');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get setup status');
    }
    return response.data.data;
  }

  async initialSetup(data: InitialSetupRequest): Promise<InitialSetupResponse> {
    const response = await this.client.post<ApiResponse<InitialSetupResponse>>('/v1/setup/init', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Setup failed');
    }
    return response.data.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/v1/auth/login', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Login failed');
    }

    const loginData = response.data.data;
    this.setTokens(loginData.access_token, loginData.refresh_token, loginData.expires_in);
    return loginData;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/v1/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    const response = await this.client.get<ApiResponse<UserInfo>>('/v1/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get user info');
    }
    return response.data.data;
  }

  // ==================== Users ====================

  async listUsers(): Promise<UserInfo[]> {
    const response = await this.client.get<ApiResponse<UserInfo[]>>('/v1/users');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to list users');
    }
    return response.data.data;
  }

  async createUser(data: CreateUserRequest): Promise<UserInfo> {
    const response = await this.client.post<ApiResponse<UserInfo>>('/v1/users', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create user');
    }
    return response.data.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserInfo> {
    const response = await this.client.put<ApiResponse<UserInfo>>(`/v1/users/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update user');
    }
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<boolean>>(`/v1/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete user');
    }
  }

  // ==================== API Keys ====================

  async listApiKeys(): Promise<ApiKey[]> {
    const response = await this.client.get<ApiResponse<ApiKey[]>>('/v1/apikeys');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to list API keys');
    }
    return response.data.data;
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await this.client.post<ApiResponse<ApiKey>>('/v1/apikeys', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create API key');
    }
    return response.data.data;
  }

  async revokeApiKey(id: string): Promise<void> {
    const response = await this.client.put<ApiResponse<boolean>>(`/v1/apikeys/${id}/revoke`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to revoke API key');
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<boolean>>(`/v1/apikeys/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete API key');
    }
  }

  // ==================== Settings ====================

  async getSystemSettings(): Promise<SystemSettings> {
    const response = await this.client.get<ApiResponse<SystemSettings>>('/v1/settings/system');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get system settings');
    }
    return response.data.data;
  }

  async updateSystemSettings(data: SystemSettings): Promise<SystemSettings> {
    const response = await this.client.put<ApiResponse<SystemSettings>>('/v1/settings/system', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update system settings');
    }
    return response.data.data;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await this.client.get<ApiResponse<NotificationSettings>>('/v1/settings/notifications');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get notification settings');
    }
    return response.data.data;
  }

  async updateNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
    const response = await this.client.put<ApiResponse<NotificationSettings>>('/v1/settings/notifications', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update notification settings');
    }
    return response.data.data;
  }

  async getStorageSettings(): Promise<StorageSettings> {
    const response = await this.client.get<ApiResponse<StorageSettings>>('/v1/settings/storage');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get storage settings');
    }
    return response.data.data;
  }

  async getRetentionPolicy(): Promise<RetentionPolicy> {
    const response = await this.client.get<ApiResponse<RetentionPolicy>>('/v1/settings/retention');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get retention policy');
    }
    return response.data.data;
  }

  async updateRetentionPolicy(data: RetentionPolicy): Promise<RetentionPolicy> {
    const response = await this.client.put<ApiResponse<RetentionPolicy>>('/v1/settings/retention', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update retention policy');
    }
    return response.data.data;
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await this.client.get<ApiResponse<SecuritySettings>>('/v1/settings/security');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get security settings');
    }
    return response.data.data;
  }

  async updateSecuritySettings(data: SecuritySettings): Promise<SecuritySettings> {
    const response = await this.client.put<ApiResponse<SecuritySettings>>('/v1/settings/security', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update security settings');
    }
    return response.data.data;
  }

  // ==================== Metrics & Alerts ====================

  async getMetrics(): Promise<SecurityMetrics> {
    const response = await this.client.get<ApiResponse<SecurityMetrics>>('/v1/metrics');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get metrics');
    }
    return response.data.data;
  }

  async getMetricsSummary(): Promise<MetricsSummary> {
    const response = await this.client.get<ApiResponse<MetricsSummary>>('/v1/metrics/summary');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get metrics summary');
    }
    return response.data.data;
  }

  async getAlerts(params?: { unacknowledged_only?: boolean; min_level?: string }): Promise<Alert[]> {
    const response = await this.client.get<ApiResponse<Alert[]>>('/v1/alerts', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get alerts');
    }
    return response.data.data;
  }

  async getAlertCount(): Promise<AlertCount> {
    const response = await this.client.get<ApiResponse<AlertCount>>('/v1/alerts/count');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get alert count');
    }
    return response.data.data;
  }

  async acknowledgeAlert(id: string): Promise<void> {
    const response = await this.client.post<ApiResponse<boolean>>(`/v1/alerts/${id}/acknowledge`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to acknowledge alert');
    }
  }

  // ==================== Agents & Services ====================

  async getAgents(): Promise<AgentInfo[]> {
    const response = await this.client.get<ApiResponse<AgentInfo[]>>('/v1/agents');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get agents');
    }
    return response.data.data;
  }

  async getAgent(agentId: string): Promise<AgentInfo> {
    const response = await this.client.get<ApiResponse<AgentInfo>>(`/v1/agents/${agentId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get agent');
    }
    return response.data.data;
  }

  async getAgentServices(agentId: string): Promise<ServiceInfo[]> {
    const response = await this.client.get<ApiResponse<ServiceInfo[]>>(`/v1/agents/${agentId}/services`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get agent services');
    }
    return response.data.data;
  }

  async getAllServices(): Promise<ServiceWithAgent[]> {
    const response = await this.client.get<ApiResponse<ServiceWithAgent[]>>('/v1/services');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get services');
    }
    return response.data.data;
  }

  // ==================== Detection Rules ====================

  async getDetectionRules(): Promise<DetectionRule[]> {
    const response = await this.client.get<ApiResponse<DetectionRule[]>>('/v1/rules');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get detection rules');
    }
    return response.data.data;
  }

  async getDetectionRuleStats(): Promise<DetectionRuleStats> {
    const response = await this.client.get<ApiResponse<DetectionRuleStats>>('/v1/rules/stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get detection rule stats');
    }
    return response.data.data;
  }

  // ==================== Reports ====================

  async getDailyReport(): Promise<Report> {
    const response = await this.client.get<ApiResponse<Report>>('/v1/report/daily');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get daily report');
    }
    return response.data.data;
  }

  // ==================== Health ====================

  async healthCheck(): Promise<{ status: string; version: string; uptime_secs: number }> {
    const response = await this.client.get<ApiResponse<{ status: string; version: string; uptime_secs: number }>>('/health');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Health check failed');
    }
    return response.data.data;
  }
}

// Export singleton instance
export const api = new GhostApiClient();
