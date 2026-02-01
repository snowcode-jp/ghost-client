//! Ghost CLI - セキュリティ監視ツールのコマンドラインインターフェース

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use colored::*;
use serde::de::DeserializeOwned;
use serde::Deserialize;
use tabled::{Table, Tabled};

/// Ghost Security Monitor CLI
#[derive(Parser)]
#[command(name = "ghost")]
#[command(author, version, about = "セキュリティ監視ツールのCLI", long_about = None)]
struct Cli {
    /// APIサーバーのURL
    #[arg(short, long, default_value = "http://localhost:3000")]
    server: String,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// システムステータスを表示
    Status,

    /// メトリクスを表示
    Metrics {
        /// サマリーを表示
        #[arg(short, long)]
        summary: bool,
    },

    /// アラートを管理
    Alerts {
        #[command(subcommand)]
        action: AlertsAction,
    },

    /// 暗号監査を実行
    Crypto {
        #[command(subcommand)]
        action: CryptoAction,
    },

    /// 異常検知を実行
    Detect,

    /// レポートを生成
    Report,

    /// デモデータを生成
    Demo,
}

#[derive(Subcommand)]
enum AlertsAction {
    /// アラート一覧を表示
    List {
        /// 未確認のみ表示
        #[arg(short, long)]
        unacknowledged: bool,
    },
    /// アラート統計を表示
    Count,
    /// すべてのアラートを確認済みにする
    AckAll,
}

#[derive(Subcommand)]
enum CryptoAction {
    /// ターゲットを監査
    Audit {
        /// 監査対象のホスト名
        target: String,
    },
    /// 監査結果を表示
    Results,
    /// 監査レポートを表示
    Report,
}

// ==================== APIレスポンス ====================

#[derive(Deserialize)]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct HealthResponse {
    status: String,
    version: String,
}

#[derive(Deserialize)]
struct MetricsSummary {
    total_attacks: u64,
    total_defenses: u64,
    total_anomalies: u64,
    defense_rate: f64,
}

#[derive(Deserialize)]
struct Alert {
    id: String,
    level: String,
    title: String,
    message: String,
    created_at: String,
    acknowledged: bool,
}

#[derive(Deserialize)]
struct AlertCount {
    total: usize,
    unacknowledged: usize,
    info: usize,
    warning: usize,
    critical: usize,
}

#[derive(Deserialize)]
struct CryptoAuditResult {
    target: String,
    tls_version: String,
    cipher_suite: String,
    is_secure: bool,
    security_score: u8,
}

// ==================== テーブル表示用 ====================

#[derive(Tabled)]
struct AlertRow {
    #[tabled(rename = "レベル")]
    level: String,
    #[tabled(rename = "タイトル")]
    title: String,
    #[tabled(rename = "メッセージ")]
    message: String,
    #[tabled(rename = "確認")]
    acknowledged: String,
}

#[derive(Tabled)]
struct CryptoRow {
    #[tabled(rename = "ターゲット")]
    target: String,
    #[tabled(rename = "TLS")]
    tls_version: String,
    #[tabled(rename = "暗号方式")]
    cipher_suite: String,
    #[tabled(rename = "スコア")]
    security_score: String,
    #[tabled(rename = "状態")]
    status: String,
}

// ==================== API クライアント ====================

struct ApiClient {
    base_url: String,
    client: reqwest::Client,
}

impl ApiClient {
    fn new(base_url: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            client: reqwest::Client::new(),
        }
    }

    async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        let url = format!("{}/api{}", self.base_url, path);
        let response: ApiResponse<T> = self
            .client
            .get(&url)
            .send()
            .await
            .context("APIリクエスト失敗")?
            .json()
            .await
            .context("レスポンスのパース失敗")?;

        if response.success {
            response.data.context("データがありません")
        } else {
            anyhow::bail!(response.error.unwrap_or_else(|| "不明なエラー".to_string()))
        }
    }

    async fn post<T: DeserializeOwned>(&self, path: &str, body: Option<&str>) -> Result<T> {
        let url = format!("{}/api{}", self.base_url, path);
        let mut request = self.client.post(&url);

        if let Some(body) = body {
            request = request
                .header("Content-Type", "application/json")
                .body(body.to_string());
        }

        let response: ApiResponse<T> = request
            .send()
            .await
            .context("APIリクエスト失敗")?
            .json()
            .await
            .context("レスポンスのパース失敗")?;

        if response.success {
            response.data.context("データがありません")
        } else {
            anyhow::bail!(response.error.unwrap_or_else(|| "不明なエラー".to_string()))
        }
    }
}

// ==================== コマンド実行 ====================

async fn cmd_status(client: &ApiClient) -> Result<()> {
    let health: HealthResponse = client.get("/health").await?;

    println!("\n{}", "🛡️ Ghost Security Monitor".bold());
    println!("{}", "=".repeat(40));
    println!("ステータス: {}", health.status.green());
    println!("バージョン: {}", health.version);
    println!();

    Ok(())
}

async fn cmd_metrics(client: &ApiClient, summary: bool) -> Result<()> {
    if summary {
        let data: MetricsSummary = client.get("/metrics/summary").await?;

        println!("\n{}", "📊 メトリクスサマリー".bold());
        println!("{}", "=".repeat(40));
        println!("攻撃検知:   {}", data.total_attacks.to_string().red());
        println!("防御成功:   {}", data.total_defenses.to_string().green());
        println!("異常検知:   {}", data.total_anomalies.to_string().yellow());
        println!("防御率:     {}%", format!("{:.1}", data.defense_rate).cyan());
        println!();
    } else {
        let data: serde_json::Value = client.get("/metrics").await?;
        println!("\n{}", "📊 現在のメトリクス".bold());
        println!("{}", serde_json::to_string_pretty(&data)?);
    }

    Ok(())
}

async fn cmd_alerts_list(client: &ApiClient, unacknowledged_only: bool) -> Result<()> {
    let path = if unacknowledged_only {
        "/alerts?unacknowledged_only=true"
    } else {
        "/alerts"
    };

    let alerts: Vec<Alert> = client.get(path).await?;

    println!("\n{}", "🚨 アラート一覧".bold());

    if alerts.is_empty() {
        println!("アラートはありません");
        return Ok(());
    }

    let rows: Vec<AlertRow> = alerts
        .into_iter()
        .map(|a| {
            let level = match a.level.as_str() {
                "critical" => "要確認".red().to_string(),
                "warning" => "注意".yellow().to_string(),
                _ => "情報".green().to_string(),
            };
            AlertRow {
                level,
                title: a.title,
                message: if a.message.len() > 40 {
                    format!("{}...", &a.message[..40])
                } else {
                    a.message
                },
                acknowledged: if a.acknowledged { "✓" } else { "-" }.to_string(),
            }
        })
        .collect();

    let table = Table::new(rows).to_string();
    println!("{}", table);

    Ok(())
}

async fn cmd_alerts_count(client: &ApiClient) -> Result<()> {
    let count: AlertCount = client.get("/alerts/count").await?;

    println!("\n{}", "🚨 アラート統計".bold());
    println!("{}", "=".repeat(40));
    println!("合計:     {}", count.total);
    println!("未確認:   {}", count.unacknowledged.to_string().yellow());
    println!("情報:     {}", count.info.to_string().green());
    println!("警告:     {}", count.warning.to_string().yellow());
    println!("重大:     {}", count.critical.to_string().red());
    println!();

    Ok(())
}

async fn cmd_alerts_ack_all(client: &ApiClient) -> Result<()> {
    let alerts: Vec<Alert> = client.get("/alerts?unacknowledged_only=true").await?;

    for alert in &alerts {
        let _: bool = client
            .post(&format!("/alerts/{}/acknowledge", alert.id), None)
            .await?;
    }

    println!(
        "{}",
        format!("✓ {}件のアラートを確認済みにしました", alerts.len()).green()
    );

    Ok(())
}

async fn cmd_crypto_audit(client: &ApiClient, target: &str) -> Result<()> {
    let body = format!(r#"{{"target": "{}"}}"#, target);
    let result: CryptoAuditResult = client.post("/crypto/audit", Some(&body)).await?;

    println!("\n{}", "🔐 暗号監査結果".bold());
    println!("{}", "=".repeat(40));
    println!("ターゲット: {}", result.target);
    println!("TLSバージョン: {}", result.tls_version);
    println!("暗号方式: {}", result.cipher_suite);
    println!(
        "セキュリティスコア: {}",
        if result.security_score >= 80 {
            result.security_score.to_string().green()
        } else if result.security_score >= 50 {
            result.security_score.to_string().yellow()
        } else {
            result.security_score.to_string().red()
        }
    );
    println!(
        "状態: {}",
        if result.is_secure {
            "安全".green()
        } else {
            "要改善".red()
        }
    );
    println!();

    Ok(())
}

async fn cmd_crypto_results(client: &ApiClient) -> Result<()> {
    let results: Vec<CryptoAuditResult> = client.get("/crypto/results").await?;

    println!("\n{}", "🔐 暗号監査結果一覧".bold());

    if results.is_empty() {
        println!("監査結果がありません");
        return Ok(());
    }

    let rows: Vec<CryptoRow> = results
        .into_iter()
        .map(|r| CryptoRow {
            target: r.target,
            tls_version: r.tls_version,
            cipher_suite: if r.cipher_suite.len() > 20 {
                format!("{}...", &r.cipher_suite[..20])
            } else {
                r.cipher_suite
            },
            security_score: format!("{}点", r.security_score),
            status: if r.is_secure {
                "安全".to_string()
            } else {
                "要改善".to_string()
            },
        })
        .collect();

    let table = Table::new(rows).to_string();
    println!("{}", table);

    Ok(())
}

async fn cmd_detect(client: &ApiClient) -> Result<()> {
    let alerts: Vec<Alert> = client.post("/detector/check", None).await?;

    println!("\n{}", "🔍 異常検知結果".bold());

    if alerts.is_empty() {
        println!("{}", "異常は検出されませんでした".green());
    } else {
        println!(
            "{}",
            format!("{}件の異常を検出しました", alerts.len()).yellow()
        );
        for alert in alerts {
            let prefix = match alert.level.as_str() {
                "critical" => "🚨".to_string(),
                "warning" => "⚠️".to_string(),
                _ => "ℹ️".to_string(),
            };
            println!("  {} {}: {}", prefix, alert.title, alert.message);
        }
    }
    println!();

    Ok(())
}

async fn cmd_report(client: &ApiClient) -> Result<()> {
    let report: serde_json::Value = client.get("/report/daily").await?;

    println!("\n{}", "📄 日次セキュリティレポート".bold());
    println!("{}", "=".repeat(50));

    if let Some(title) = report.get("title").and_then(|v| v.as_str()) {
        println!("{}", title);
    }

    if let Some(summary) = report.get("metrics_summary") {
        println!("\n--- メトリクス ---");
        if let Some(attacks) = summary.get("total_attacks").and_then(|v| v.as_u64()) {
            println!("総攻撃数: {}", attacks);
        }
        if let Some(defenses) = summary.get("total_defenses").and_then(|v| v.as_u64()) {
            println!("総防御数: {}", defenses);
        }
        if let Some(rate) = summary.get("defense_rate").and_then(|v| v.as_f64()) {
            println!("防御率: {:.1}%", rate);
        }
    }

    if let Some(recommendations) = report.get("recommendations").and_then(|v| v.as_array()) {
        if !recommendations.is_empty() {
            println!("\n--- 推奨事項 ---");
            for rec in recommendations.iter().take(5) {
                if let (Some(category), Some(title)) = (
                    rec.get("category").and_then(|v| v.as_str()),
                    rec.get("title").and_then(|v| v.as_str()),
                ) {
                    println!("  • [{}] {}", category, title);
                }
            }
        }
    }

    println!();
    Ok(())
}

async fn cmd_demo(client: &ApiClient) -> Result<()> {
    let result: serde_json::Value = client.post("/demo/generate", None).await?;

    println!("\n{}", "🎲 デモデータ生成完了".bold());
    println!("{}", "=".repeat(40));

    if let Some(attacks) = result.get("attacks_generated").and_then(|v| v.as_u64()) {
        println!("攻撃: {}件", attacks);
    }
    if let Some(defenses) = result.get("defenses_generated").and_then(|v| v.as_u64()) {
        println!("防御: {}件", defenses);
    }
    if let Some(anomalies) = result.get("anomalies_generated").and_then(|v| v.as_u64()) {
        println!("異常: {}件", anomalies);
    }
    if let Some(alerts) = result.get("alerts_generated").and_then(|v| v.as_u64()) {
        println!("アラート: {}件", alerts);
    }
    println!();

    Ok(())
}

// ==================== メイン ====================

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let client = ApiClient::new(&cli.server);

    match cli.command {
        Commands::Status => cmd_status(&client).await,
        Commands::Metrics { summary } => cmd_metrics(&client, summary).await,
        Commands::Alerts { action } => match action {
            AlertsAction::List { unacknowledged } => cmd_alerts_list(&client, unacknowledged).await,
            AlertsAction::Count => cmd_alerts_count(&client).await,
            AlertsAction::AckAll => cmd_alerts_ack_all(&client).await,
        },
        Commands::Crypto { action } => match action {
            CryptoAction::Audit { target } => cmd_crypto_audit(&client, &target).await,
            CryptoAction::Results => cmd_crypto_results(&client).await,
            CryptoAction::Report => {
                let report: serde_json::Value = client.get("/crypto/report").await?;
                println!("{}", serde_json::to_string_pretty(&report)?);
                Ok(())
            }
        },
        Commands::Detect => cmd_detect(&client).await,
        Commands::Report => cmd_report(&client).await,
        Commands::Demo => cmd_demo(&client).await,
    }
}
