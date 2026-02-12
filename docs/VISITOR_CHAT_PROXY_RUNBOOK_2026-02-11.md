# Visitor Chat Fix Runbook (Landing -> App)

Date: 2026-02-11  
Status: Stable (verified by live user test)

## Summary

Landing page visitor chat was failing intermittently with:

- CORS blocked errors (`No 'Access-Control-Allow-Origin'`)
- Raw HTML rendered inside chat bubble (Remix document stream or Cloudflare challenge page)
- Registration crash (`Cannot read properties of undefined (reading 'toString')`)

Final stable solution is to use a same-origin proxy in landing and call Remix data endpoint on app.

## Final Working Architecture

1. Browser (ozzyl.com) calls same-origin:
   - `POST /api/visitor-chat` (Next.js route in `apps/landing`)
2. Next.js proxy forwards server-to-server to:
   - `https://app.ozzyl.com/api/visitor-chat?_data=routes/api.visitor-chat`
3. App returns JSON action result.
4. Landing widget updates UI from parsed JSON.

Why this works:

- No browser cross-origin call -> no CORS block on client.
- `_data=routes/api.visitor-chat` forces Remix data/action response -> avoids full HTML document stream.

## Files Changed (Working State)

- `apps/landing/components/landing/OzzylAIChatWidget.tsx`
  - Use same-origin endpoint: `'/api/visitor-chat'`
  - Add `visitorId` validation before calling `.toString()`

- `apps/landing/app/api/visitor-chat/route.ts`
  - Forward to app data endpoint:
    - `/api/visitor-chat?_data=routes/api.visitor-chat`
  - Forward JSON body as-is
  - Request with `Accept: application/json`

## Root Causes Found

1. Direct browser call to `app.ozzyl.com` caused CORS failures in some states.
2. Proxy to Remix route without `_data` sometimes returned HTML document instead of JSON.
3. UI assumed `visitorId` always exists and crashed on malformed upstream payload.

## Proper Way (Do / Don’t)

Do:

- Keep landing chat request same-origin (`/api/visitor-chat`).
- In proxy, call Remix data endpoint (`?_data=routes/...`) when expecting action JSON.
- Validate critical response fields (`visitorId`, `response`) before UI state updates.
- Surface user-friendly error if upstream payload is invalid.

Don’t:

- Don’t call `app.ozzyl.com/api/visitor-chat` directly from browser.
- Don’t parse unknown response and blindly use `data.visitorId.toString()`.
- Don’t assume Remix route URL always returns JSON for action context.

## Quick Verification Checklist

1. Open `https://ozzyl.com` and hard refresh.
2. Open widget and register with name + valid BD number.
3. Confirm no red error box appears in registration step.
4. Send message: `Pricing জানতে চাই`.
5. Confirm assistant responds with text (no HTML blob, no empty bubble).
6. Confirm no CORS error in browser console.

## If Issue Reappears

Check in this order:

1. Landing proxy response body type (must be JSON, not HTML).
2. Upstream URL in proxy (must include `_data=routes/api.visitor-chat`).
3. Widget endpoint value (must be `/api/visitor-chat`).
4. Browser console for CORS/network errors.
5. Cloudflare logs for managed challenge response on app endpoint.

If Cloudflare challenge returns HTML again, keep client safe by returning normalized JSON error from proxy (never pass raw HTML to UI).

