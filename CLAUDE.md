# Rules for Claude Code sessions in this repo

Read this, then `IMPLEMENTATION-CONTEXT.md`, then `docs/AGENTS.md` for your role.

## Repositories

- This repo is the only place TKG code is written.
- `/Users/Dear/Claude/ICW-OS-DESIGN` is **read-only**: never edit, commit, branch or push there. Ask before `git pull`.
- **Never clone, read, branch or push `ICW-AI/ICW-OS-APP` or `ICW-AI/icw-clients`.** Take ICW conventions only
  from ICW-OS-DESIGN's docs (`PLATFORM.md`, `Apps/UI-STANDARDS.md`, `CLAUDE.md`).
- Do not use anything from the old POC folder.

## UI

- Follow ICW-OS-DESIGN for look **and** structure: launcher → module with left menu (Company Core is the reference).
  The old CEO wireframe and the old TKG CI colours are retired. The only TKG brand element is the logo in `CI/`.
- Light theme. Google Sans (body, Thai) + Inter (display, numbers). Action blue `#0A66D6`. Cards radius 12, controls 8.
- Every user-visible Thai string goes through the i18n function; Thai is the key, English lives in catalogs.
- `prototype/index.html` is the approved reference for screens, menus and wording.

## Data rules (from IMPLEMENTATION-CONTEXT.md)

- Brand flag FALSE/0 in a sheet = **not specified**, never "not allowed".
- Pork is a **filter** on Materials, never its own menu.
- Never show sheet counts as "approved"; imported data is draft until approved.
- POS codes are **mappings** to the TKG ID, never a replacement for it.
- Keep legacy Material IDs (109 changed) for traceability.
- **SKU data is not final.** Do not cleanse or restructure SKU data until the user says so.

## Data files

`Data/*.xlsx` is not in git. Worktree sessions read it from `/Users/Dear/Claude/TKG-Master-Data/Data/`.
Run Python with `python3 -I`. `tools/export_data.py` uses only the standard library (no openpyxl).

## Git

- One branch and one pull request per session; branch from `main`.
- Commit or push only when the user asks.
- Stay inside the folders your role owns (`docs/AGENTS.md`). Shared files (`packages/db/schema.prisma`, root configs)
  change only in the Data/DB session.
