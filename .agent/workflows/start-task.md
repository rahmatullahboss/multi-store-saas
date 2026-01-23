---
description: Universal entry point for any complex task. Helps the agent select and load the right skills before starting value work.
---

# Start Task Workflow

Use this workflow at the beginning of ANY complex task (coding, debugging, planning, or architecture) to ensure you are using the best available knowledge and skills.

## 1. Analyze the Request

- What is the core domain? (e.g., specific framework, database, business logic)
- What technologies are involved? (e.g., Remix, Cloudflare, Prisma, Stripe)
- What is the nature of the task? (e.g., debugging, new feature, refactoring)

## 2. Identify Relevant Skills

Check the `.agent/skills/` directory for relevant skills.

- **Web/Frontend**: `remix-development`, `react-ui-patterns`, `tailwind-patterns`
- **Backend/API**: `backend-dev-guidelines`, `api-patterns`
- **Database**: `database-design`, `prisma-expert`
- **Cloudflare**: `cloudflare-d1`, `remix-development` (includes CF specifics)
- **Business**: `micro-saas-launcher`, `stripe-integration`
- **Workflow**: `git-pushing`, `systematic-debugging`

## 3. Load Skills (CRITICAL)

**You MUST read the content of the selected skills.**
Use `view_file` to read the `SKILL.md` (or equivalent) for each identified skill.

> [!IMPORTANT]
> Do not just guess standard practices. The skills contain project-specific and "Antigravity-optimized" patterns that you must follow.

```bash
# Example: If task is "Build a new Remix route with D1"
view_file .agent/skills/remix-development/SKILL.md
view_file .agent/skills/database-design/SKILL.md
```

## 4. Resolve Unknowns (Context7)

If the task requires knowledge NOT present in the skills (e.g., a specific library version or new API):

1.  Use `context7` tool to resolve the library ID.
2.  Query `context7` for the specific documentation.
3.  (Optional) Suggest creating a new skill if this knowledge will be reusable.

## 5. Create a Plan

Once skills are loaded:

1.  Create a strict step-by-step plan in `task.md` (or `implementation_plan.md` for larger features).
2.  Align the plan with the patterns found in the loaded skills.
3.  Proceed to `task_boundary` and execution.
