# QA Test Plan: [Feature Name]

## Overview

Brief description of what is being tested.

## Scope

- [ ] **In Scope**: Login flow, Password reset.
- [ ] **Out of Scope**: Registration flow, Third-party OAuth.

## Test Strategy

- **Browsers**: Chrome, Firefox, Safari (Mobile).
- **Environment**: Staging.
- **Data**: New test user for each run.

## Test Cases

### Functional

| ID    | Title        | Steps                                                      | Expected Result        | Priority |
| ----- | ------------ | ---------------------------------------------------------- | ---------------------- | -------- |
| TC-01 | Valid Login  | 1. Go to /login<br>2. Enter valid creds<br>3. Click Submit | Redirect to /dashboard | P0       |
| TC-02 | Invalid Pass | 1. Enter valid email<br>2. Enter wrong pass                | Show error message     | P1       |

### UI/UX

| ID    | Title      | Check                              |
| ----- | ---------- | ---------------------------------- |
| UI-01 | Responsive | Check layout on iPhone 12 viewport |
| UI-02 | Tab Index  | Verify tabbing order through form  |
