# Clawfinger 🦅

OpenClaw workspace, utilities & tools for automation, SQL Server management, and Azure integration.

## 🔌 Azure OpenAI Proxy

**[`/azure-proxy`](./azure-proxy/)** — Lightweight proxy that enables Azure OpenAI integration with OpenClaw.

OpenClaw doesn't natively support Azure's `api-version` query parameter requirement. This proxy bridges the gap, letting you use your Azure credits (like the $150/month Visual Studio subscription) directly with OpenClaw.

```bash
cd azure-proxy
node server.js
```

→ [Full documentation](./azure-proxy/README.md)

---

## 🗄️ SQL Server Scripts

Database automation scripts for SQL Server management. These contain credentials and are excluded from git.

| Script | Description |
|--------|-------------|
| `sql-version-check.js` | Check SQL Server versions against sqlserverbuilds.blogspot.com |
| `load-stress.js` | AdventureWorks load testing |
| `save-image.js` | Store images + metadata into SQL Server |
| `collect-nodes.js` | Sync OpenClaw nodes into SQL Server inventory |

**Setup:**
```bash
# Set real password in scripts before running:
sed -i "s/password: 'XXX'/password: 'YourRealPassword'/g" *.js
```

---

## 📁 Workspace Structure

```
clawfinger/
├── azure-proxy/        # Azure OpenAI ↔ OpenClaw bridge
├── memory/             # Daily session logs (YYYY-MM-DD.md)
├── sql/                # SQL scripts & queries
├── steipete-clone/     # Steipete's workspace patterns
├── AGENTS.md           # Agent behavior & guidelines
├── SOUL.md             # Personality & vibe
├── USER.md             # User preferences
├── TOOLS.md            # Local tool notes
└── HEARTBEAT.md        # Periodic check tasks
```

---

## 🔒 Security

- Credentials are excluded via `.gitignore`
- API keys should be set via environment variables or local config
- Never commit secrets to this repo

---

## License

MIT

---

*Part of the [OpenClaw](https://openclaw.ai) ecosystem*
