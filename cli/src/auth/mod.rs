//! クライアント認証モジュール
//!
//! ビルド時に埋め込まれた署名情報を使用してサーバーと認証

use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// ビルド時に埋め込まれた情報
pub struct EmbeddedBuildInfo {
    pub build_id: &'static str,
    pub build_timestamp: i64,
    pub source_hash: &'static str,
    pub version: &'static str,
    pub platform: &'static str,
}

impl EmbeddedBuildInfo {
    /// コンパイル時に埋め込まれた情報を取得
    pub fn get() -> Self {
        Self {
            build_id: env!("GHOST_BUILD_ID"),
            build_timestamp: env!("GHOST_BUILD_TIMESTAMP")
                .parse()
                .unwrap_or(0),
            source_hash: env!("GHOST_SOURCE_HASH"),
            version: env!("GHOST_VERSION"),
            platform: env!("GHOST_PLATFORM"),
        }
    }
}

/// ビルド情報（サーバーに送信）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildInfo {
    pub build_id: String,
    pub build_timestamp: i64,
    pub source_hash: String,
    pub binary_hash: String,
    pub version: String,
    pub platform: String,
    pub signature: String,
}

impl BuildInfo {
    /// 埋め込み情報から生成
    pub fn from_embedded() -> Self {
        let embedded = EmbeddedBuildInfo::get();

        // バイナリハッシュは実行時に計算
        let binary_hash = Self::compute_binary_hash();

        // 署名は環境変数から取得（ビルドスクリプトで設定）
        let signature = option_env!("GHOST_SIGNATURE")
            .unwrap_or("")
            .to_string();

        Self {
            build_id: embedded.build_id.to_string(),
            build_timestamp: embedded.build_timestamp,
            source_hash: embedded.source_hash.to_string(),
            binary_hash,
            version: embedded.version.to_string(),
            platform: embedded.platform.to_string(),
            signature,
        }
    }

    /// 実行中のバイナリのハッシュを計算
    fn compute_binary_hash() -> String {
        // 実行ファイルのパスを取得してハッシュ
        if let Ok(exe_path) = std::env::current_exe() {
            if let Ok(data) = std::fs::read(&exe_path) {
                let mut hasher = Sha256::new();
                hasher.update(&data);
                return hex::encode(hasher.finalize());
            }
        }
        "unknown".to_string()
    }

    /// 署名対象のデータを生成
    pub fn signing_data(&self) -> Vec<u8> {
        let mut data = Vec::new();
        data.extend(self.build_id.as_bytes());
        data.extend(&self.build_timestamp.to_le_bytes());
        data.extend(self.source_hash.as_bytes());
        data.extend(self.binary_hash.as_bytes());
        data.extend(self.version.as_bytes());
        data.extend(self.platform.as_bytes());
        data
    }
}

/// システム情報（フィンガープリント用）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub mac_hash: String,
    pub machine_id: String,
    pub os_fingerprint: String,
    pub boot_time: i64,
}

impl SystemInfo {
    /// システム情報を収集
    pub fn collect() -> Result<Self> {
        Ok(Self {
            mac_hash: Self::get_mac_hash()?,
            machine_id: Self::get_machine_id()?,
            os_fingerprint: Self::get_os_fingerprint(),
            boot_time: Self::get_boot_time(),
        })
    }

    fn get_mac_hash() -> Result<String> {
        let hostname = hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string());

        let mut hasher = Sha256::new();
        hasher.update(hostname.as_bytes());
        hasher.update(std::process::id().to_le_bytes());

        if let Ok(user) = std::env::var("USER").or_else(|_| std::env::var("USERNAME")) {
            hasher.update(user.as_bytes());
        }

        Ok(hex::encode(hasher.finalize()))
    }

    fn get_machine_id() -> Result<String> {
        #[cfg(target_os = "linux")]
        {
            if let Ok(id) = std::fs::read_to_string("/etc/machine-id") {
                return Ok(id.trim().to_string());
            }
        }

        #[cfg(target_os = "macos")]
        {
            if let Ok(output) = std::process::Command::new("ioreg")
                .args(["-rd1", "-c", "IOPlatformExpertDevice"])
                .output()
            {
                let output_str = String::from_utf8_lossy(&output.stdout);
                for line in output_str.lines() {
                    if line.contains("IOPlatformUUID") {
                        if let Some(uuid) = line.split('"').nth(3) {
                            return Ok(uuid.to_string());
                        }
                    }
                }
            }
        }

        // フォールバック
        let hostname = hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string());

        let mut hasher = Sha256::new();
        hasher.update(b"machine_id_fallback");
        hasher.update(hostname.as_bytes());
        Ok(hex::encode(&hasher.finalize()[..16]))
    }

    fn get_os_fingerprint() -> String {
        format!(
            "{}-{}-{}",
            std::env::consts::OS,
            std::env::consts::ARCH,
            std::env::consts::FAMILY
        )
    }

    fn get_boot_time() -> i64 {
        Utc::now().timestamp() - 3600 // 仮の値
    }
}

/// クライアント認証リクエスト（新形式）
#[derive(Debug, Clone, Serialize)]
pub struct ClientAuthRequest {
    /// ビルド情報
    pub build_info: BuildInfo,
    /// システム情報
    pub system_info: SystemInfo,
    /// タイムスタンプ（ミリ秒）
    pub timestamp: i64,
    /// ノンス（リプレイ攻撃防止）
    pub nonce: String,
}

impl ClientAuthRequest {
    /// 新しいリクエストを作成
    pub fn new() -> Result<Self> {
        Ok(Self {
            build_info: BuildInfo::from_embedded(),
            system_info: SystemInfo::collect()?,
            timestamp: Utc::now().timestamp_millis(),
            nonce: format!("{}{}", uuid::Uuid::new_v4(), uuid::Uuid::new_v4()),
        })
    }
}

/// 認証レスポンス
#[derive(Debug, Clone, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub client_id: Option<String>,
    pub trust_score: Option<u8>,
    pub warnings: Vec<String>,
    pub error: Option<String>,
}

/// クライアント認証器
pub struct ClientAuthenticator {
    server_url: String,
}

impl ClientAuthenticator {
    /// 新しい認証器を作成
    pub fn new(server_url: &str) -> Self {
        Self {
            server_url: server_url.to_string(),
        }
    }

    /// サーバーに認証リクエストを送信
    pub async fn authenticate(&self) -> Result<AuthResponse> {
        let client = reqwest::Client::new();
        let request = ClientAuthRequest::new()?;

        let response = client
            .post(&format!("{}/v1/client/auth", self.server_url))
            .json(&request)
            .send()
            .await
            .context("サーバーへの接続に失敗")?;

        response
            .json()
            .await
            .context("レスポンスのパースに失敗")
    }

    /// ビルド情報を表示
    pub fn print_build_info() {
        let info = BuildInfo::from_embedded();
        println!("Build ID:        {}", info.build_id);
        println!("Build Timestamp: {}", info.build_timestamp);
        println!("Source Hash:     {}", info.source_hash);
        println!("Version:         {}", info.version);
        println!("Platform:        {}", info.platform);
        println!("Binary Hash:     {}...", &info.binary_hash[..16]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_info() {
        let info = BuildInfo::from_embedded();
        assert!(!info.build_id.is_empty());
        assert!(!info.version.is_empty());
    }

    #[test]
    fn test_system_info() {
        let info = SystemInfo::collect().unwrap();
        assert!(!info.mac_hash.is_empty());
        assert!(!info.machine_id.is_empty());
    }
}
