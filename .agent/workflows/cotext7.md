---
description: Use Context7 MCP to fetch documentation and manage skills
---

# Context7 Workflow

This workflow guides the agent on how to effective use the Context7 MCP server to retrieve up-to-date documentation and manage skills.

## 1. Resolve Library ID

Before querying documentation, you usually need a precise Library ID.

- **Action**: Call `mcp_context7_resolve-library-id`
- **Parameters**:
  - `query`: The user's specific question or context (e.g., "drizzle orm batch insert")
  - `libraryName`: The name of the library (e.g., "drizzle-orm", "hono", "cloudflare-workers")

## 2. Query Documentation

Once you have a library ID (or if you can guess it, e.g., `/cloudflare/cloudflare-docs`), query for specific information.

- **Action**: Call `mcp_context7_query-docs`
- **Parameters**:
  - `libraryId`: The resolved ID (e.g., `/websites/v2_remix_run`)
  - `query`: Your specific technical question.

## 3. Manage Skills (Optional)

If the user asks to "install a skill" or "find a skill":

- **Search**: `npx ctx7 skills search <term>` (using `run_command`)
- **Install**: `npx ctx7 skills install <repo> <skill-name> --antigravity` (using `run_command`)
- **List**: `npx ctx7 skills list --antigravity` (using `run_command`)

## 4. Common Library IDs for Ozzyl

- **Cloudflare**: `/cloudflare/cloudflare-docs`
- **Remix v2**: `/websites/v2_remix_run`
- **Hono**: `/honojs/website`
- **Drizzle**: `/llmstxt/orm_drizzle_team_llms_txt`
- **Tailwind**: `/tailwindcss/tailwindcss`
- **React**: `/react/react`
- **Zod**: `/colinhacks/zod`

## 5. Best Practices

- Always prefer querying Context7 over general web search for library-specific syntax.
- Use the widely known IDs directly to save a step.
- If `query-docs` returns 404 or empty, try resolving the ID again with a broader term.
