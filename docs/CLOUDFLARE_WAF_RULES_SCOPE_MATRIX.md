# Cloudflare WAF Rules + Scope Matrix (Ozzyl)

## Applied Ruleset

- Zone: `ozzyl.com`
- Zone ID: `41147efa7d197cfddda0af7fcbf6d641`
- Ruleset ID: `dd790e969e454dda9fedab62de639d7e`
- Phase: `http_request_firewall_custom`
- Name: `ozzyl-custom-firewall`

## Rule JSON

```json
{
  "name": "ozzyl-custom-firewall",
  "description": "Reduce bot/scanner traffic before Worker invocation",
  "kind": "zone",
  "phase": "http_request_firewall_custom",
  "rules": [
    {
      "action": "block",
      "description": "Block common exploit/scanner paths (excluding verified bots)",
      "expression": "(not cf.client.bot and (http.request.uri.path contains \"/wp-admin\" or http.request.uri.path eq \"/wp-login.php\" or http.request.uri.path eq \"/xmlrpc.php\" or http.request.uri.path contains \"/.env\" or http.request.uri.path contains \"/.git\" or http.request.uri.path contains \"/vendor/phpunit\" or http.request.uri.path contains \"/boaform/admin/formLogin\"))"
    },
    {
      "action": "managed_challenge",
      "description": "Challenge likely automation user-agents (excluding verified bots)",
      "expression": "(not cf.client.bot and (lower(http.user_agent) contains \"python-requests\" or lower(http.user_agent) contains \"curl/\" or lower(http.user_agent) contains \"wget/\" or lower(http.user_agent) contains \"scrapy\" or lower(http.user_agent) contains \"go-http-client\" or lower(http.user_agent) contains \"java/\"))"
    }
  ]
}
```

## Scope Matrix (Minimum)

| Feature | Required Access |
|---|---|
| List zones | `Zone:Read` |
| Read rulesets | `Zone:Read` + `WAF:Read` |
| Create/update custom WAF rules | `Zone:Read` + `WAF:Edit` |
| Worker deploy/update | `Workers Scripts:Edit` |
| Worker analytics | `Analytics:Read` + `Workers:Read` |
| KV read/write | `Workers KV Storage:Edit` |
| D1 read/write | `D1:Edit` |

## Token Strategy (Recommended)

1. `ops-read-token` (read-only: zone + analytics)
2. `waf-admin-token` (WAF write only)
3. `deploy-token` (Workers/KV/D1 write for CI/CD)

## Monitoring Checklist (24h before/after)

1. Worker invocations delta
2. Firewall events (blocked/challenged)
3. Challenge solve/pass rate
4. False positives for legit users
5. Search crawler health in logs
