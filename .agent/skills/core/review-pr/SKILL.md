---
name: "review-pr"
description: "Review pull requests with best practices"
when_to_use: "When you need to review code changes before merge"
allowed-tools: ["Read", "Write", "Grep", "Bash(git diff:*)", "Bash(git log:*)"]
model: "claude-3-5-sonnet"
---

# PR Review Process

## Step 1: Analyze Changes

1. Use `git diff` to see what changed
2. Read the modified files
3. Check for security issues (SQL injection, XSS)

## Step 2: Code Quality

1. Look for duplicate code
2. Check function complexity (over 50 lines is warning)
3. Verify error handling
4. Ensure `cn()` is used for class merging (Tailwind v4)
5. Ensure `context.cloudflare.env.DB` usage (Cloudflare D1)

## Step 3: Testing

1. Check if tests exist for new features
2. Run existing tests: `npm run test`
3. Verify coverage doesn't drop

## Step 4: Documentation

1. Check if README updated
2. Verify inline comments for complex logic

## Output Format

Provide review in this format:

```json
{
  "approved": boolean,
  "issues": [...],
  "suggestions": [...]
}
```

## Error Handling

If tests fail, ask user to fix before approval.
