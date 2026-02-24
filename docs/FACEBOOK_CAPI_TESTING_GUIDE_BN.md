# Facebook Conversion API (CAPI) — টেস্টিং গাইড 🇧🇩

> **উদ্দেশ্য**: Meta Ads Manager ছাড়াই আমাদের Server-Side CAPI implementation সঠিকভাবে কাজ করছে কিনা যাচাই করা।  
> **শেষ আপডেট**: ২০২৬-০২-২৪  
> **সংশ্লিষ্ট ফাইল**: `apps/web/app/services/facebook-capi.server.ts`

---

## 📋 সূচিপত্র

1. [Pre-requisite চেকলিস্ট](#-pre-requisite-চেকলিস্ট)
2. [ধাপ ১ — Hashing সঠিক কিনা যাচাই](#-ধাপ-১--hashing-সঠিক-কিনা-যাচাই)
3. [ধাপ ২ — Phone Normalization যাচাই](#-ধাপ-২--phone-normalization-যাচাই)
4. [ধাপ ৩ — Manual API Call দিয়ে Test](#-ধাপ-৩--manual-api-call-দিয়ে-test)
5. [ধাপ ৪ — Local Dev Server-এ Integration Test](#-ধাপ-৪--local-dev-server-এ-integration-test)
6. [ধাপ ৫ — Meta Graph API Explorer দিয়ে Test](#-ধাপ-৫--meta-graph-api-explorer-দিয়ে-test)
7. [ধাপ ৬ — Meta Events Manager Test Events Tool](#-ধাপ-৬--meta-events-manager-test-events-tool)
8. [Common Errors ও সমাধান](#-common-errors-ও-সমাধান)
9. [EMQ Score চেক করা](#-emq-score-চেক-করা)

---

## ✅ Pre-requisite চেকলিস্ট

Meta Ads Manager-এ যাওয়ার আগে এগুলো থাকতে হবে:

- [ ] `FACEBOOK_PIXEL_ID` — Meta Events Manager থেকে
- [ ] `FACEBOOK_CAPI_ACCESS_TOKEN` — Meta Business Settings > System Users থেকে
- [ ] `wrangler.toml`-এ অথবা Cloudflare Dashboard-এ secret set করা
- [ ] Node.js 20+ installed (local test-এর জন্য)

---

## 🔐 ধাপ ১ — Hashing সঠিক কিনা যাচাই

Meta-র official hashing requirement অনুযায়ী test করুন।

### Node.js দিয়ে local test:

```bash
node -e "
const crypto = require('crypto');

// ইমেইল হ্যাশিং টেস্ট
// Input: 'John_Smith@gmail.com' → Normalize → lowercase trim → hash
const email = 'John_Smith@gmail.com'.trim().toLowerCase();
console.log('Email hash:', crypto.createHash('sha256').update(email).digest('hex'));
// Expected: 62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f

// Phone হ্যাশিং টেস্ট (BD format)
// Input: '01712345678' → '8801712345678'
const phone = '8801712345678'; // 01xxx → 880 + 1xxx
console.log('Phone hash:', crypto.createHash('sha256').update(phone).digest('hex'));

// City হ্যাশিং টেস্ট
// 'Dhaka' → lowercase, no spaces/punctuation
const city = 'dhaka';
console.log('City hash:', crypto.createHash('sha256').update(city).digest('hex'));

// Country হ্যাশিং টেস্ট
const country = 'bd'; // lowercase ISO 3166-1 alpha-2
console.log('Country hash:', crypto.createHash('sha256').update(country).digest('hex'));
// Expected: 3e591ebea5ffd03cf32da61e3c8afec6b4e8cc9e0f34cb17ae81f82d9d3e88dd
"
```

### Expected Results (Meta Official Examples):

| Field | Input | Normalized | Expected Hash (first 10 chars) |
|---|---|---|---|
| `em` | `John_Smith@gmail.com` | `john_smith@gmail.com` | `62a14e44f7...` |
| `ph` | `01712345678` | `8801712345678` | (যাচাই করুন) |
| `fn` | `Mohammad` | `mohammad` | (যাচাই করুন) |
| `country` | `BD` | `bd` | `3e591ebea5...` |

---

## 📱 ধাপ ২ — Phone Normalization যাচাই

বাংলাদেশের বিভিন্ন phone format ঠিকমতো normalize হচ্ছে কিনা:

```bash
node -e "
function normalizePhone(phone) {
  if (!phone) return undefined;
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return undefined;
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '880' + cleaned.substring(1);
  } else if (cleaned.startsWith('8801') && cleaned.length === 13) {
    // already correct
  } else if (cleaned.startsWith('880') && cleaned.length === 12) {
    // already correct
  }
  return cleaned;
}

// Test cases
const tests = [
  '01712345678',      // standard BD
  '+8801712345678',   // with +
  '8801712345678',    // already with country code
  '017-123-45678',    // with dashes
  '+880 171 234 5678', // with spaces
  '(017) 12345678',   // with parens
];

tests.forEach(t => {
  console.log(t.padEnd(25), '->', normalizePhone(t));
});
"
```

### Expected Output:

```
01712345678               -> 8801712345678
+8801712345678            -> 8801712345678
8801712345678             -> 8801712345678
017-123-45678             -> 8801712345678  ✅
+880 171 234 5678         -> 8801712345678  ✅
(017) 12345678            -> 8801712345678  ✅
```

---

## 🌐 ধাপ ৩ — Manual API Call দিয়ে Test

> ⚠️ এই step-এর জন্য Pixel ID এবং Access Token লাগবে। যদি না থাকে, ধাপ ৪-এ যান।

### cURL দিয়ে সরাসরি Meta API-তে call:

```bash
# Environment variables set করুন
export PIXEL_ID="your_pixel_id_here"
export CAPI_TOKEN="your_access_token_here"

# Test Purchase Event পাঠান
curl -X POST \
  "https://graph.facebook.com/v22.0/${PIXEL_ID}/events" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "event_name": "Purchase",
      "event_time": '"$(date +%s)"',
      "event_id": "test_purchase_'"$(date +%s)"'",
      "action_source": "website",
      "event_source_url": "https://yourstore.com/checkout",
      "user_data": {
        "em": "62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f",
        "ph": "e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176",
        "country": "3e591ebea5ffd03cf32da61e3c8afec6b4e8cc9e0f34cb17ae81f82d9d3e88dd",
        "client_ip_address": "1.2.3.4",
        "client_user_agent": "Mozilla/5.0 (Test)"
      },
      "custom_data": {
        "value": 500.00,
        "currency": "bdt",
        "order_id": "TEST-001",
        "content_type": "product",
        "content_ids": ["123"],
        "contents": [{"id": "123", "quantity": 1, "item_price": 500.00, "delivery_category": "home_delivery"}],
        "num_items": 1
      }
    }],
    "access_token": "'"${CAPI_TOKEN}"'",
    "partner_agent": "ozzyl-saas-1.0"
  }'
```

### Expected Success Response:

```json
{
  "events_received": 1,
  "warnings": [],
  "fbtrace_id": "some_trace_id"
}
```

### Test Events Code সহ (Events Manager-এ visible হবে):

```bash
# test_event_code যোগ করুন — Events Manager > Test Events tab থেকে নিন
curl -X POST \
  "https://graph.facebook.com/v22.0/${PIXEL_ID}/events" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{...same as above...}],
    "access_token": "'"${CAPI_TOKEN}"'",
    "partner_agent": "ozzyl-saas-1.0",
    "test_event_code": "TEST12345"
  }'
```

---

## 🖥️ ধাপ ৪ — Local Dev Server-এ Integration Test

Ads Manager ছাড়াই আমাদের code-এর পুরো flow test করা:

### ৪.১ — Test Script বানান:

```bash
# tmp_rovodev_test_capi.mjs নামে file বানান workspace root-এ
cat > /tmp/tmp_test_capi.mjs << 'EOF'
import { createHash } from 'crypto';

// facebook-capi.server.ts-এর same normalization logic
function normalizePhone(phone) {
  if (!phone) return undefined;
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return undefined;
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '880' + cleaned.substring(1);
  }
  return cleaned;
}

function normalizeName(name) {
  if (!name) return undefined;
  return name.trim().toLowerCase().replace(/[^\u{61}-\u{7A}\u{41}-\u{5A}\u{0080}-\u{FFFF}\s]/gu, '').trim();
}

function normalizeCity(city) {
  if (!city) return undefined;
  return city.trim().toLowerCase().replace(/\s+/g, '');
}

function hashData(data) {
  if (!data || !data.trim()) return undefined;
  return createHash('sha256').update(data).digest('hex');
}

// Test payload যা আমাদের code পাঠাবে
const testPayload = {
  em: hashData('test@example.com'),
  ph: hashData(normalizePhone('01712345678')),
  fn: hashData(normalizeName('Mohammad')),
  ln: hashData(normalizeName('Rahman')),
  ct: hashData(normalizeCity('Dhaka')),
  st: hashData('dhakadistrict'),
  country: hashData('bd'),
};

console.log('\n✅ Test Payload (normalized + hashed):');
console.log(JSON.stringify(testPayload, null, 2));

// Validate required fields
const required = ['em', 'ph'];
const missing = required.filter(f => !testPayload[f]);
if (missing.length) {
  console.error('\n❌ Missing required fields:', missing);
} else {
  console.log('\n✅ All required fields present!');
}

// Check hash format (should be 64 hex chars)
Object.entries(testPayload).forEach(([key, val]) => {
  if (val && val.length !== 64) {
    console.error(`❌ ${key}: invalid hash length (${val.length})`);
  } else if (val) {
    console.log(`✅ ${key}: valid SHA256 hash`);
  }
});
EOF

node /tmp/tmp_test_capi.mjs
```

### ৪.২ — Local Wrangler Server-এ Test:

```bash
# Terminal 1: Dev server চালু করুন
cd apps/web
npm run dev:wrangler

# Terminal 2: Checkout করুন এবং order দিন
# তারপর wrangler logs-এ দেখুন:
# [FB CAPI] Purchase sent (pixel: xxx, events_received: 1)
```

### ৪.৩ — wrangler tail দিয়ে production logs দেখুন:

```bash
cd apps/web
wrangler tail --format pretty 2>&1 | grep "FB CAPI"
```

Expected log output:
```
[FB CAPI] ViewContent sent (pixel: 123456789, events_received: 1)
[FB CAPI] AddToCart sent (pixel: 123456789, events_received: 1)
[FB CAPI] InitiateCheckout sent (pixel: 123456789, events_received: 1)
[FB CAPI] Purchase sent (pixel: 123456789, events_received: 1)
```

---

## 🔬 ধাপ ৫ — Meta Graph API Explorer দিয়ে Test

> Meta-র নিজস্ব tool দিয়ে payload validate করুন — Ads Manager account লাগবে কিন্তু campaign চালাতে হবে না।

1. যান: [https://developers.facebook.com/tools/explorer/](https://developers.facebook.com/tools/explorer/)
2. **API Version**: `v22.0` select করুন
3. **Method**: `POST`
4. **Endpoint**: `/{PIXEL_ID}/events`
5. **Body**-তে নিচের JSON paste করুন (access_token query param-এ দিন):

```json
{
  "data": [
    {
      "event_name": "ViewContent",
      "event_time": 1700000000,
      "event_id": "test_view_001",
      "action_source": "website",
      "event_source_url": "https://yourstore.com/products/test",
      "user_data": {
        "em": "62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f",
        "client_ip_address": "1.2.3.4",
        "client_user_agent": "Mozilla/5.0 (Test Browser)"
      },
      "custom_data": {
        "value": 1200.00,
        "currency": "bdt",
        "content_type": "product",
        "content_ids": ["prod_123"],
        "content_name": "Test Product"
      }
    }
  ]
}
```

### Success হলে:
```json
{"events_received": 1, "warnings": [], "fbtrace_id": "..."}
```

---

## 📊 ধাপ ৬ — Meta Events Manager Test Events Tool

> এটা সবচেয়ে powerful tool — real-time-এ events দেখা যায়।

### Setup:

1. যান: [Meta Events Manager](https://business.facebook.com/events_manager)
2. আপনার **Pixel** select করুন
3. **Test Events** tab-এ click করুন
4. `test_event_code` copy করুন (যেমন: `TEST98765`)

### Code-এ test_event_code use করুন:

```typescript
// apps/web/app/services/facebook-capi.server.ts-এর sendPurchaseEvent call-এ
// শুধু DEV environment-এ:

const IS_TEST = process.env.NODE_ENV !== 'production';

context.cloudflare.ctx.waitUntil(
  sendPurchaseEvent({
    pixelId: store.facebookPixelId,
    accessToken: store.facebookAccessToken,
    // ... বাকি params
    testEventCode: IS_TEST ? 'TEST98765' : undefined, // ← এখানে বসান
  })
);
```

### Environment variable দিয়ে control করুন:

```bash
# wrangler.toml-এ (dev only!)
[vars]
CAPI_TEST_EVENT_CODE = "TEST98765"

# Production-এ এই variable রাখবেন না
```

### Events Manager-এ কী দেখবেন:

```
Event Name      | Match Quality | Status
----------------|---------------|--------
ViewContent     | ████████░░ 8  | ✅ Received
AddToCart       | ████████░░ 8  | ✅ Received
InitiateCheckout| ████████░░ 8  | ✅ Received
Purchase        | █████████░ 9  | ✅ Received
```

---

## ❌ Common Errors ও সমাধান

### Error 1: `Invalid OAuth access token`
```json
{"error": {"message": "Invalid OAuth access token", "code": 190}}
```
**সমাধান**: Access token মেয়াদ শেষ। Meta Business Settings > System Users-এ গিয়ে নতুন token generate করুন।

---

### Error 2: `(#100) Missing required parameter`
```json
{"error": {"message": "Missing required parameter", "code": 100}}
```
**সমাধান**: `event_name`, `event_time`, `action_source` missing। সব required fields দিন।

---

### Error 3: `events_received: 0` (no error কিন্তু events নেই)
**কারণ**: Pixel ID ভুল অথবা pixel disabled।  
**সমাধান**: 
```bash
# Pixel ID verify করুন
curl "https://graph.facebook.com/v22.0/YOUR_PIXEL_ID?access_token=YOUR_TOKEN"
```

---

### Error 4: EMQ Score কম (৫-এর নিচে)
**কারণ**: User data কম পাঠানো হচ্ছে।  
**সমাধান**: নিচের চেকলিস্ট follow করুন:

```
✅ em (email)          — সবচেয়ে গুরুত্বপূর্ণ
✅ ph (phone)          — BD format: 8801XXXXXXXXX
✅ fn/ln (name)        — split করে পাঠান
✅ external_id         — customer ID
✅ fbp (_fbp cookie)   — browser থেকে পড়ুন
✅ fbc (_fbc cookie)   — URL থেকে পড়ুন
✅ client_ip_address   — CF-Connecting-IP header
✅ client_user_agent   — User-Agent header
✅ country (bd)        — সবসময় পাঠান
✅ ct (city/district)  — order form থেকে
✅ st (division)       — order form থেকে
✅ zp (postal code)    — optional কিন্তু helpful
```

---

### Error 5: Deduplication কাজ করছে না
**কারণ**: Browser Pixel এবং CAPI-তে `event_id` আলাদা।  
**সমাধান**: 
```typescript
// Browser Pixel-এ:
fbq('track', 'Purchase', data, { eventID: 'purchase_ORDER_ID_TIMESTAMP' });

// Server CAPI-তে same event_id:
sendPurchaseEvent({ eventId: 'purchase_ORDER_ID_TIMESTAMP', ... });
```

---

## 📈 EMQ Score চেক করা

Meta-র Dataset Quality API দিয়ে programmatically EMQ score দেখুন:

```bash
curl "https://graph.facebook.com/v22.0/dataset_quality?\
fields=web{event_match_quality{composite_score,match_key_feedback{identifier,coverage{percentage}}},event_name}&\
dataset_id=YOUR_PIXEL_ID&\
agent_name=ozzyl-saas-1.0&\
access_token=YOUR_TOKEN" | python3 -m json.tool
```

### Expected Response (ভালো score-এর ক্ষেত্রে):

```json
{
  "web": [
    {
      "event_match_quality": {
        "composite_score": 9.1,
        "match_key_feedback": [
          {"identifier": "email", "coverage": {"percentage": 95}},
          {"identifier": "phone", "coverage": {"percentage": 88}},
          {"identifier": "external_id", "coverage": {"percentage": 100}},
          {"identifier": "ip_address", "coverage": {"percentage": 99}}
        ]
      },
      "event_name": "Purchase"
    }
  ]
}
```

### Score Interpretation:

| Score | মানে | Action |
|---|---|---|
| **9-10** | Excellent 🟢 | কিছু করার নেই |
| **7-8** | Good 🟡 | আরও data পাঠানোর চেষ্টা করুন |
| **5-6** | Average 🟠 | Email/Phone মিস হচ্ছে কিনা দেখুন |
| **0-4** | Poor 🔴 | Implementation review করুন |

---

## 🚀 Production Deployment Checklist

Meta Ads Manager-এ connect করার আগে:

- [ ] সব local tests pass করেছে
- [ ] `wrangler tail`-এ `[FB CAPI] Purchase sent` দেখা গেছে
- [ ] cURL test-এ `events_received: 1` পেয়েছেন
- [ ] `test_event_code` production code থেকে **remove** করা হয়েছে
- [ ] `FACEBOOK_PIXEL_ID` Cloudflare secret-এ set করা আছে
- [ ] `FACEBOOK_CAPI_ACCESS_TOKEN` Cloudflare secret-এ set করা আছে
- [ ] Browser Pixel এবং CAPI উভয়েই same `event_id` পাঠাচ্ছে (deduplication)

---

## 📞 সহায়তা

- **Meta Developer Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Events Manager**: https://business.facebook.com/events_manager
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Pixel Helper Chrome Extension**: পাবেন Chrome Web Store-এ — browser-side pixel verify করতে

---

*এই গাইড `apps/web/app/services/facebook-capi.server.ts` implementation অনুযায়ী তৈরি।*
