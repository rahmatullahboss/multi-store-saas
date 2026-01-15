# Pull Request (PR) Review Checklist

## Correctness

- [ ] Does the code actually solve the problem as described?
- [ ] Are there any edge cases (null, empty, error states) missed?
- [ ] Does it work on all supported environments (e.g., mobile)?

## Quality & Maintainability

- [ ] **Naming**: do variables/functions reveal intent?
- [ ] **DRY**: Is code duplicated? Can it be extracted?
- [ ] **Complexity**: Is it too clever? Simpler is better.
- [ ] **Tests**: Are there tests covering the new logic?

## Security

- [ ] **Inputs**: Are all user inputs validated?
- [ ] **Auth**: Is the endpoint protected?
- [ ] **Secrets**: Are there no hardcoded keys/passwords?

## Performance

- [ ] **N+1**: Are we fetching data efficiently?
- [ ] **Memoization**: Are we recalculating expensive things unnecessarily?
