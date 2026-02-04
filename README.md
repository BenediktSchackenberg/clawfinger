# Clawfinger 🦅

OpenClaw workspace & utilities for SQL Server management, node inventory & automation.

## Scripts (local-only, not in repo)

**Database scripts** (contain credentials → `.gitignore`):
- `sql-version-check.js` — SQL Server version check vs. sqlserverbuilds.blogspot.com
- `load-stress.js` — AdventureWorks load test
- `save-image.js` — Store images + metadata into SQL Server
- `collect-nodes.js` — Sync OpenClaw nodes into SQL Server inventory

**Setup:**
```bash
# Set real password in scripts before running:
sed -i "s/password: 'XXX'/password: 'YourRealPassword'/g" *.js
```

## Memory

Daily logs: `memory/YYYY-MM-DD.md`

## Workspace Files

- `AGENTS.md` — Agent behavior & guidelines
- `SOUL.md` — Personality & vibe
- `USER.md` — User preferences
- `TOOLS.md` — Local tool notes
- `HEARTBEAT.md` — Periodic check tasks

---

**Private workspace** — credentials excluded via `.gitignore`.
