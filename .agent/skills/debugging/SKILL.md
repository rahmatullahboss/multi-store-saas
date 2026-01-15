---
name: Debugging
description: A systematic approach to identifying, isolating, and resolving software defects.
---

# Debugging Skill

You are a master troubleshooter. You do not guess; you verify. You approach bugs scientifically.

## The Scientific Debugging Process

1.  **Reproduce**: Can you make it happen consistently? (Use `examples/reproduction_template.md`).
2.  **Isolate**: Remove noise. Is it the frontend, the backend (Loader/Action), or the database (D1)?
3.  **Log Analysis**:
    - **Server-Side**: Run `npx wrangler pages deployment tail` to see real-time logs from Cloudflare.
    - **Client-Side**: Check Browser Console. Look for "Hydration failed" or "Text content does not match server-rendered HTML".
4.  **Hypothesize**: "I think the Loader is returning null, causing the hydration mismatch."
5.  **Verify**: Test the hypothesis. (e.g., Log the loader return value).
6.  **Fix & Regression Test**: ensuring it doesn't break again.

## Common Issues (Remix & Cloudflare)

- **Hydration Errors**: Usually caused by invalid HTML nesting (`<a>` inside `<a>`) or dates/random numbers matching incorrectly between Server and Client. Use `<ClientOnly>` for browser-specific rendering.
- **D1 Log Lag**: Logs/Analytics for D1 might be delayed. Trust `wrangler tail` for live debugging.
- **Env Bindings**: `env.DB` is undefined? Check `wrangler.toml` binding or local `platform.env` mock.

## Techniques & Tools

- **Log Analysis**:
  - **Read carefully**: The error message usually tells you the file and line number.
  - **Stack Traces**: Look for the first line of _your_ code in the trace.
  - **Structured Logging**: Log objects, not just strings. `console.log({ user })` is better than `console.log(user)`.
- **Binary Search**: If you don't know where the error is, cut the problem in half. Remove half the code/inputs. If it persists, it's in the remaining half. Repeat.
- **Hypothesis Testing**: Form a hypothesis ("I think X is null"), then test it ("Console log X").
- **Rubber Ducking**: Explain the code line-by-line to an imaginary (or real) duck. This often reveals the flaw in logic.

## Common Pitfalls

- **Assumptions**: "That function definitely works." -> _Verify it._
- **Caching**: Browser cache, build cache, DNS cache. -> _Clear caches when things don't make sense._
- **Race Conditions**: Async operations finishing in unexpected order. -> _Check `await` usage and state updates._
- **Typos**: Simple spelling mistakes in variable names or keys. -> _Use strict typing/linting._

## Resolution Template

When a bug is fixed, ask:

1.  What was the root cause?
2.  Why did it happen?
3.  How was it fixed?
4.  How can we prevent it from happening again? (e.g., add a test, improve types)
