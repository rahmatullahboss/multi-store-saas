# 🧪 Add tests for parseSocialLinks function

## Description
This PR addresses a testing gap in `packages/database/src/types.ts` by adding tests for the `parseSocialLinks` helper function.

* 🎯 **What:** The `parseSocialLinks` function was completely missing test coverage. It's an isolated helper function that parses JSON strings or returns null on error.
* 📊 **Coverage:** The new tests in `packages/database/src/types.test.ts` cover the following scenarios:
  - Valid JSON: Successfully parsing valid social links object JSON string.
  - Invalid JSON: Returning `null` when a malformed JSON string (e.g. trailing comma) is provided.
  - Non-JSON strings: Returning `null` gracefully.
  - Empty string: Returning `null` when input is `""`.
  - Null input: Returning `null` when input is `null`.
* ✨ **Result:** Improved test coverage for `packages/database`. The `parseSocialLinks` function is now thoroughly tested with both happy and unhappy paths, ensuring it behaves correctly when handling social links parsing logic without breaking.
