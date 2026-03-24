

# Project Memory — multi-store-saas
> 36 notes | Score threshold: >40

## Safety — Never Run Destructive Commands

> Dangerous commands are actively monitored.
> Critical/high risk commands trigger error notifications in real-time.

- **NEVER** run `rm -rf`, `del /s`, `rmdir`, `format`, or any command that deletes files/directories without EXPLICIT user approval.
- **NEVER** run `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, or any destructive database operation.
- **NEVER** run `git push --force`, `git reset --hard`, or any command that rewrites history.
- **NEVER** run `npm publish`, `docker rm`, `terraform destroy`, or any irreversible deployment/infrastructure command.
- **NEVER** pipe remote scripts to shell (`curl | bash`, `wget | sh`).
- **ALWAYS** ask the user before running commands that modify system state, install packages, or make network requests.
- When in doubt, **show the command first** and wait for approval.

**Stack:** TypeScript/JavaScript/Python · React + Tailwind

## 📝 NOTE: 1 uncommitted file(s) in working tree.\n\n## Important Warnings

- **gotcha in bolt.md** — File updated (external): .Jules/bolt.md

Content summary (10 lines):
#

## Active: `.Jules`

- **convention in palette.md**
- **gotcha in bolt.md**
- **convention in palette.md**
- **what-changed in palette.md**
- **what-changed in sentinel.md**

## Project Standards

- convention in palette.md
- convention in palette.md
- convention in store-live-editor.tsx

## Recent Decisions

- Optimized Multi — offloads heavy computation off the main thread
- Optimized Optimize — parallelizes async operations for speed
- decision in SettingsPanel.tsx
- decision in SectionList.tsx

## Learned Patterns

- Avoid: gotcha in .gitignore (seen 2x)

## Available Tools (ON-DEMAND only)
- `query(q)` — Deep search when stuck
- `find(query)` — Full-text lookup
> Context above IS your context. Do NOT call load() at startup.
