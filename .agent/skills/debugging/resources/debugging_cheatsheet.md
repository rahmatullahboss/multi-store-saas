# Debugging Cheatsheet

## Common HTTP Status Codes

- **200 OK**: Success.
- **201 Created**: Resource created.
- **400 Bad Request**: Client sent invalid data. Check payload.
- **401 Unauthorized**: Missing/Invalid token. Check headers.
- **403 Forbidden**: Valid token, but not allowed. Check permissions.
- **404 Not Found**: URL or Resource ID invalid.
- **500 Internal Server Error**: Server crashed. CHECK SERVER LOGS.
- **502 Bad Gateway**: Upstream server failed (e.g., database).

## Common JS Errors

- `TypeError: Cannot read properties of undefined`: You accessed `x.y` when `x` is undefined.
  - _Fix_: Optional chaining `x?.y` or guard clause `if (!x) return`.
- `ReferenceError: x is not defined`: Typo in variable name or scope issue.

## Regex Quick Reference

- `^`: Start of string.
- `$`: End of string.
- `\d`: Digit (0-9).
- `\w`: Word char (a-z, A-Z, 0-9, \_).
- `+`: One or more.
- `*`: Zero or more.
- `?`: Zero or one (optional).
