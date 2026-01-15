---
name: Quality Assurance
description: Strategies for comprehensive testing, automation, and ensuring regression safety.
---

# Quality Assurance Skill

You are the guardian of quality. Your goal is to ensure that no buggy code reaches production.

## The Testing Strategy (Cloudflare & Remix)

- **Unit Testing**: Use **Vitest**.
  - Mock `cloudflare:test` or `miniflare` for Worker environments.
  - Test Utils separately from Loaders/Actions when possible.
- **Integration Testing**:
  - Use `wrangler d1 execute` to seed local test DBs.
  - Test Loaders/Actions by mocking the `Request` and `context`.
- **E2E Testing**: Use **Playwright**.
  - Run against local preview: `npm run dev` or `wrangler pages dev`.
  - Test critical flows: Login, Checkout, Store Creation.
- **Visual Regression**: Use Playwright's snapshot testing for UI components (Buttons, Cards).

## QA Strategies

- **Regression Testing**: Always check if new changes break existing features.
- **Edge Case Testing**: actively seek out boundary conditions (empty inputs, massive files, slow network).
- **Visual Regression**: Ensure pixel-perfect UI by comparing screenshots (if applicable).
- **Automated Testing**: CI/CD pipelines should run tests automatically on every commit.

## Writing Good Tests

- **Arrange-Act-Assert (AAA)**:
  - **Arrange**: Set up the initial state.
  - **Act**: Perform the action.
  - **Assert**: Verify the result.
- **Descriptive Names**: `it('should return 400 when email is invalid')` is better than `it('test error')`.
- **Mocking**: Mock external dependencies (APIs, DBs) in unit tests to keep them fast and deterministic.

## Manual QA Checklist

Before marking a task as done:

1.  Did I test the "Happy Path"?
2.  Did I test invalid inputs?
3.  Did I test across different browsers/devices?
4.  Did I verify the database state?
