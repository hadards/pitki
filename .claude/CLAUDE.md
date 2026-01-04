# CLAUDE.md

This file defines how Claude Code must work in this repository on a Windows (VS Code) workflow.

## Non-negotiable rules

### Security / secrets
- Never hardcode secrets (OAuth secrets, DB credentials, API keys, tokens).
- Never commit any `.env` file.
- Do not edit or create real `.env` values in the repo.
- If configuration is needed, use environment variables at runtime and (optionally) maintain a `.env.example` with placeholders only.

### Database (SQL-first)
- Do not add runtime schema creation, schema sync, or “auto-migrate” logic in application code.
- Every database schema change must include:
  1) a new SQL migration file
  2) an updated canonical “current schema” SQL snapshot file for this repo
- Keep migrations and the canonical schema snapshot consistent.

### Constants
- Do not share constants between client and server.
- Within each side, centralize repeated literals (URLs, durations, limits, route strings, etc.) into a dedicated constants module for that side.
- Prefer descriptive constant names over “magic numbers/strings”.

### Design
- No business logic duplication. When logic appears twice, extract and reuse.
- Keep responsibilities separated:
  - UI rendering concerns stay in UI code
  - HTTP/request wiring stays at the HTTP boundary
  - business rules remain centralized (single source of truth)
  - integrations (DB/OAuth/AI) remain isolated from business rules