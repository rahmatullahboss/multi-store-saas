---
description: Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md.
---

# Start Task: Manus File-Based Planning

This workflow implements the **Manus Pattern** for managing complex tasks. Instead of relying solely on context, we explicitly manage state in three markdown files in the project root.

**Use this for:** Any task requiring >5 steps, research, refactoring, or complex feature implementation.

## Step 1: Initialize Planning Files

Create the following three files in the root of the workspace if they don't exist.

### 1.1 Create `task_plan.md` (The "Brain")

This is your master checklist. It must be updated after every phase.

```markdown
# Task Plan: [Task Name]

## Goal

[One clear sentence describing the successfully completed state]

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Phases

### Phase 1: Context & Research

- [ ] [AGENT: Research Agent] [CONTEXT] Read relevant files `[file1, file2]`
- [ ] [AGENT: Research Agent] [RESEARCH] Check documentation for [library/API]

### Phase 2: Implementation

- [ ] [AGENT: Coding Agent] [CODE] Create `src/foo.ts`
- [ ] [AGENT: Coding Agent] [CODE] Update `src/bar.ts`

### Phase 3: Verification

- [ ] [AGENT: Testing Agent] [TEST] Run `npm test`
- [ ] [AGENT: Testing Agent] [VERIFY] Manual check of feature
```

### 1.2 Create `findings.md` (The "Knowledge Base")

Store all research, documentation snippets, and existing code patterns here.

```markdown
# Findings

## Relevant Code

- `src/existing.ts`: Implements similar logic in `processData()` function.

## Documentation

- **API Endpoint**: `POST /api/v1/users` requires `Authorization` header.

## Decisions

- [ ] Decision 1: Use Library X because Y.
```

### 1.3 Create `progress.md` (The "Log")

Log every action, valid output, and error here.

```markdown
# Progress Log

## Session 1

- **Action**: Ran `npm run build`
- **Result**: Failed with error `TS2345`
- **Fix**: Updated type definition in `types.ts`
```

---

## Step 2: Load Skills

Before acting, identify and read relevant "Antigravity Skills" to ensure best practices.

**Required check:**

- Is this React/Remix? -> Load `remix`, `web-design-guidelines`, `frontend-design`
- Is this Backend? -> Load `hono`, `wrangler`, `database-design`
- Is this Database? -> Load `database-design`, `wrangler`
- Is this SaaS/Architecture? -> Load `micro-saas-launcher`, `c4-architecture`, `saas-architect`
- Is this Debugging? -> Load `systematic-debugging`

```bash
view_file .agent/skills/relevant-skill/SKILL.md
```

---

## Step 3: Execution Loop (The "Manus Cycle")

Follow this loop for every phase:

1.  **READ**: Read `task_plan.md` to confirm the next step.
2.  **ACT**: Perform the tool call (Edit, Run, etc.).
3.  **LOG**: Append the result to `progress.md`.
4.  **UPDATE**: If a step is done, mark `[x]` in `task_plan.md`.
5.  **FINDING**: If you learned something new, append to `findings.md`.

**CRITICAL RULE**: "After every 2 tool calls, update your files."

---

## Step 4: Completion

When the task is done:

1.  Verify all SUCCESS CRITERIA in `task_plan.md` are checked.
2.  Summarize the final state in `progress.md`.
3.  Notify the user.
