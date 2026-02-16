---
name: Claude Code Guide
description: Master guide for using Claude Code effectively. Includes configuration, permissions, and subagents.
---

# Claude Code Guide

This guide covers advanced configuration, permission management, and best practices for using Claude Code in this project.

## 🛡️ Permissions & Security

Claude Code is secure by default, interacting with your system only through approved tools.

### Dangerously Skip Permissions

To bypass permission prompts for a session (useful for autonomous tasks or trusted environments), use the `--dangerously-skip-permissions` flag when starting Claude.

```bash
claude --dangerously-skip-permissions
```

**⚠️ Warning**: This allows Claude to execute ANY command (file edits, shell commands) without your approval. Use with caution.

### Persistent Permissions (`config.toml`)

To permanently skip permissions for tools (like the `--dangerously-skip-permissions` flag but saved), edit `~/.claude/config.toml`:

```toml
[permissions]
# Automatically allow specific tools without asking
allow = ["Bash", "FileEdit", "Notebook"]

# Tools that always require approval
ask = ["WebSearch"]
```

This runs Claude in "Yellow Mode" (Auto-Approve) for the specified tools.

## ⚙️ Configuration

### Project-Specific Settings

Claude Code looks for a `CLAUDE.md` file in the project root for project-specific instructions.

### User Settings (`config.toml`)

Global settings are stored in `~/.claude/config.toml`.

```toml
[preferred_editor]
command = "code"

[theme]
mode = "dark"
```

## 🤖 Subagents

This project has specialized subagents configured. Invoke them using `@mention` in the CLI.

| Subagent                | Handle                 | Expertise              |
| :---------------------- | :--------------------- | :--------------------- |
| **Database Architect**  | `@database-architect`  | D1, SQL, Schema Design |
| **Frontend Specialist** | `@frontend-specialist` | Remix, React, Tailwind |
| **QA Engineer**         | `@qa-engineer`         | Tests, Debugging       |

**Example Usage**:

> `@database-architect How do I add a 'loyalty_points' column to the customers table?`

## 🧠 "Thinking" Keywords

Use these keywords in your prompts to trigger specific reasoning modes:

- **"Think step-by-step"**: Forces a detailed plan before execution. Good for complex refactors.
- **"Analyze root cause"**: Useful for debugging.
- **"Verify assumptions"**: When you're unsure if the info is correct.

## 🧩 Common Issues

### "Command not found: claude"

Ensure Claude Code is installed and in your PATH.
`npm install -g @anthropic-ai/claude-code`

### "Permission denied"

Check your file permissions or use `sudo` if absolutely necessary (not recommended for Claude).
