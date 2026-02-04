//! ビルドスクリプト
//!
//! コンパイル時にビルド情報を埋め込む

use std::env;
use std::process::Command;

fn main() {
    // ビルド時の情報を環境変数から取得（またはデフォルト生成）
    let build_id = env::var("GHOST_BUILD_ID")
        .unwrap_or_else(|_| generate_build_id());

    let build_timestamp = env::var("GHOST_BUILD_TIMESTAMP")
        .unwrap_or_else(|_| {
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs().to_string())
                .unwrap_or_else(|_| "0".to_string())
        });

    let source_hash = env::var("GHOST_SOURCE_HASH")
        .unwrap_or_else(|_| get_git_hash());

    let version = env::var("GHOST_VERSION")
        .unwrap_or_else(|_| env!("CARGO_PKG_VERSION").to_string());

    let platform = env::var("GHOST_PLATFORM")
        .unwrap_or_else(|_| {
            format!("{}-{}",
                std::env::consts::OS,
                std::env::consts::ARCH
            )
        });

    // cargo:rustc-env を使って環境変数として埋め込む
    println!("cargo:rustc-env=GHOST_BUILD_ID={}", build_id);
    println!("cargo:rustc-env=GHOST_BUILD_TIMESTAMP={}", build_timestamp);
    println!("cargo:rustc-env=GHOST_SOURCE_HASH={}", source_hash);
    println!("cargo:rustc-env=GHOST_VERSION={}", version);
    println!("cargo:rustc-env=GHOST_PLATFORM={}", platform);

    // 再ビルドのトリガー
    println!("cargo:rerun-if-env-changed=GHOST_BUILD_ID");
    println!("cargo:rerun-if-env-changed=GHOST_BUILD_TIMESTAMP");
    println!("cargo:rerun-if-env-changed=GHOST_SOURCE_HASH");
    println!("cargo:rerun-if-env-changed=GHOST_VERSION");
    println!("cargo:rerun-if-env-changed=GHOST_PLATFORM");
    println!("cargo:rerun-if-env-changed=GHOST_SIGNATURE");
}

/// ビルドIDを生成
fn generate_build_id() -> String {
    // 簡易的なUUID生成
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    use std::time::SystemTime;

    let mut hasher = DefaultHasher::new();
    SystemTime::now().hash(&mut hasher);
    std::process::id().hash(&mut hasher);

    let hash = hasher.finish();
    format!("{:016x}-{:04x}-{:04x}-{:04x}-{:012x}",
        hash >> 32,
        (hash >> 16) & 0xffff,
        hash & 0xffff,
        (hash >> 48) & 0xffff,
        hash & 0xffffffffffff
    )
}

/// Gitコミットハッシュを取得
fn get_git_hash() -> String {
    Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                String::from_utf8(output.stdout).ok()
            } else {
                None
            }
        })
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}
