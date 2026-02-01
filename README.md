# Ghost Client

<p align="center">
  <img src="docs/images/ghost-logo.svg" alt="Ghost Security Monitor" width="200">
</p>

<p align="center">
  <strong>Enterprise-grade SIEM/XDR Dashboard & CLI</strong>
</p>

<p align="center">
  <a href="https://github.com/snowcode-jp/ghost-client/releases"><img src="https://img.shields.io/github/v/release/snowcode-jp/ghost-client" alt="Release"></a>
  <a href="https://github.com/snowcode-jp/ghost-client/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://github.com/sponsors/snowcode-jp"><img src="https://img.shields.io/badge/sponsor-GitHub%20Sponsors-EA4AAA" alt="Sponsor"></a>
</p>

---

## Overview

Ghost Client provides the user interface for [Ghost Security Monitor](https://github.com/snowcode-jp/ghost-server), an open-source SIEM/XDR platform.

- **Web Dashboard**: Real-time security monitoring interface
- **CLI Tool**: Command-line interface for automation and scripting
- **Multi-language**: English, Japanese, Chinese, Korean, and more

## Quick Start

### Web Dashboard

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### CLI

```bash
cd cli
cargo build --release
./target/release/ghost-cli --help
```

## Features

### Dashboard

- Real-time threat detection visualization
- Alert management and investigation
- Compliance scorecards
- Custom dashboards
- Dark/Light theme

### CLI

- `ghost status` - System health check
- `ghost alerts` - Manage alerts
- `ghost scan` - Run security scans
- `ghost report` - Generate reports
- `ghost config` - Configuration management

## Configuration

Connect to your Ghost Server:

```bash
# Environment variable
export GHOST_API_URL=https://your-ghost-server.com:6660

# Or config file
cat > ~/.ghost/config.toml << EOF
[server]
url = "https://your-ghost-server.com:6660"
api_key = "your-api-key"
EOF
```

## Sponsorship

Ghost is open-source software maintained by volunteers. Your sponsorship helps us continue development and keep core features free.

### Why Sponsor?

- Keep Ghost open-source and free
- Fund security audits
- Support new features development
- Get priority support

### Sponsor Tiers

| Tier | Price | Benefits |
|------|-------|----------|
| **Individual** | $5/month | Early access, Sponsor badge |
| **Team** | $50/month | Team license (10 users), Custom integrations |
| **Enterprise** | $500/month | Unlimited users, Dedicated support, Custom compliance |

[**Become a Sponsor on GitHub Sponsors**](https://github.com/sponsors/snowcode-jp)

## License

MIT License - See [LICENSE](LICENSE) for details.

## Links

- [Ghost Server](https://github.com/snowcode-jp/ghost-server) - Backend (Private)
- [Documentation](https://ghost.snowcode.jp/docs)
- [Discord Community](https://discord.gg/ghost-security)
