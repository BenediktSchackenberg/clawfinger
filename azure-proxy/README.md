# Azure OpenAI Proxy for OpenClaw 🔌

A lightweight Node.js proxy that enables Azure OpenAI integration with OpenClaw.

## The Problem

OpenClaw constructs API URLs by appending `/chat/completions` to the provider's `baseUrl`:

```javascript
const endpoint = `${baseUrl}/chat/completions`;
```

Azure OpenAI requires a `?api-version=YYYY-MM-DD` query parameter:

```
https://{resource}.openai.azure.com/openai/deployments/{model}/chat/completions?api-version=2025-01-01-preview
```

When you put the `api-version` in the baseUrl, OpenClaw's path append breaks it:

```
❌ .../gpt-4o?api-version=2025-01-01-preview/chat/completions
```

## The Solution

This proxy sits between OpenClaw and Azure, forwarding requests with the correct URL structure:

```
OpenClaw → http://localhost:18790/chat/completions
    ↓
Proxy adds api-version query param
    ↓
Azure ← https://{resource}.openai.azure.com/.../chat/completions?api-version=...
```

## Quick Start

### 1. Configure Environment

```bash
export AZURE_OPENAI_ENDPOINT="your-resource.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT="gpt-4o"
export AZURE_OPENAI_API_VERSION="2025-01-01-preview"
```

Or edit the config section in `server.js` directly.

### 2. Run the Proxy

```bash
node server.js
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║         🚀 Azure OpenAI Proxy for OpenClaw               ║
╠══════════════════════════════════════════════════════════╣
║  Proxy:      http://127.0.0.1:18790                      ║
║  Deployment: gpt-4o                                      ║
║  API Ver:    2025-01-01-preview                          ║
║  Target:     your-resource.openai.azure.com              ║
╚══════════════════════════════════════════════════════════╝
```

### 3. Configure OpenClaw

Add this provider to your `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "providers": {
      "azure-gpt4o": {
        "baseUrl": "http://127.0.0.1:18790",
        "apiKey": "YOUR_AZURE_API_KEY",
        "api": "openai-completions",
        "authHeader": false,
        "headers": {
          "api-key": "YOUR_AZURE_API_KEY"
        },
        "models": [
          {
            "id": "gpt-4o",
            "name": "GPT-4o (Azure)"
          }
        ]
      }
    }
  }
}
```

**Important:** Set `authHeader: false` so OpenClaw doesn't add a `Bearer` token (Azure uses `api-key` header instead).

### 4. Allow the Model

Add to your allowlist:

```json
{
  "agents": {
    "defaults": {
      "models": {
        "azure-gpt4o/gpt-4o": {}
      }
    }
  }
}
```

### 5. (Optional) Use for Subagents

Save Azure credits by using GPT-4o for automated tasks:

```json
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": "azure-gpt4o/gpt-4o"
      }
    }
  }
}
```

## Run as a Service (Linux)

### systemd User Service

Create `~/.config/systemd/user/azure-proxy.service`:

```ini
[Unit]
Description=Azure OpenAI Proxy for OpenClaw
After=network.target

[Service]
Type=simple
Environment="AZURE_OPENAI_ENDPOINT=your-resource.openai.azure.com"
Environment="AZURE_OPENAI_DEPLOYMENT=gpt-4o"
Environment="AZURE_OPENAI_API_VERSION=2025-01-01-preview"
WorkingDirectory=/path/to/azure-proxy
ExecStart=/usr/bin/node /path/to/azure-proxy/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Enable and start:

```bash
systemctl --user daemon-reload
systemctl --user enable azure-proxy
systemctl --user start azure-proxy

# Check status
systemctl --user status azure-proxy

# View logs
journalctl --user -u azure-proxy -f
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AZURE_PROXY_PORT` | `18790` | Local proxy port |
| `AZURE_PROXY_BIND` | `127.0.0.1` | Bind address |
| `AZURE_OPENAI_ENDPOINT` | — | Your Azure resource hostname |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | Deployment name |
| `AZURE_OPENAI_API_VERSION` | `2025-01-01-preview` | API version |

## Health Check

```bash
curl http://localhost:18790/health
# {"status":"ok","deployment":"gpt-4o"}
```

## Why Not Just Use OpenRouter?

You could! But if you have Azure credits (like the $150/month Visual Studio subscription), this lets you use them directly without a middleman taking a cut.

## Troubleshooting

### 404 Resource not found

- Check your `AZURE_OPENAI_ENDPOINT` — should be just the hostname, not a full URL
- Verify the deployment name matches what's in Azure Portal
- Confirm the model is actually deployed and ready

### 401 Unauthorized

- API key is wrong or expired
- Make sure you're passing the key in both the OpenClaw config and the proxy is forwarding it

### Content Filter Errors

Azure has... aggressive content filtering. Some prompts that work on OpenAI directly may get blocked. This is an Azure thing, not a proxy issue.

## License

MIT — do whatever you want with it. 🤘

---

*Built for the [OpenClaw](https://openclaw.ai) community*
