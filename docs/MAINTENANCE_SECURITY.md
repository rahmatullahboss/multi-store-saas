# 🛡️ Security & Maintenance Monitoring Guide

This document outlines the regular routines required to keep the Multi-Store SaaS secure, performant, and stable.

---

## 📅 Periodic Routines

### 🕒 Daily (15 Minutes)

Target: Catch immediate issues before they escalate.

- [ ] **Sentry Error Check:** Review last 24h errors in [Sentry Dashboard](https://sentry.io).
  - _Action:_ Fix recurring exceptions affecting >1% of users.
- [ ] **Rate Limit Review:** Check Cloudflare logs for blocked IPs.
  - _Note:_ If a legitimate custom domain is blocked, adjust `validateOrigin` in `server/index.ts`.
- [ ] **Health Check:** Ensure [UptimeRobot](https://uptimerobot.com) shows 100% uptime for `/api/health`.

### 🗓️ Weekly (Saturday/Off-Peak)

Target: Proactive hardening and backup verification.

- [ ] **Nightly Security Scan Review:** Check GitHub Actions for `nightly-security.yml` results.
- [ ] **Dependency Audit:** Run `npm audit` and `npm outdated`.
  - _Action:_ Update non-breaking security patches.
- [ ] **D1 Backup Verification:**
  - 1. Go to Cloudflare Dashboard > D1.
  - 2. Verify daily backup was successful.
  - 3. _Bonus:_ Try restoring to a "test" database once a month.
- [ ] **E2E Test Run:** Ensure all critical flows pass in `e2e/` using Playwright.

### 📅 Monthly (1-2 Hours)

Target: Long-term health and cost optimization.

- [ ] **CORS Review:** Audit `staticAllowedOrigins` in `server/index.ts`. Remove any temporary domains (e.g., `digitalcare.site`).
- [ ] **Infrastructure Cost Review:** Check Cloudflare and AI usage bills for anomalies.
- [ ] **Database Index Optimization:** Identify slow queries via Cloudflare D1 logs and add necessary indexes in `db/schema.ts`.
- [ ] **Security Token Rotation:** Rotate staging/test API keys if shared with temporary consultants.

---

## 🛠️ Essential Tools

| Tool               | Purpose                                   | Frequency                |
| ------------------ | ----------------------------------------- | ------------------------ |
| **GitHub Actions** | Automated Security Scans (Semgrep, Audit) | Every Push / Nightly     |
| **Sentry**         | Real-time Error Tracking                  | 24/7                     |
| **UptimeRobot**    | External Availability Monitoring          | Every 5 min              |
| **Cloudflare D1**  | Database Backups                          | Automatic (Check Weekly) |
| **Playwright**     | Critical User Flow Testing                | Weekly                   |

---

## 🚨 Incident Response (Cheat Sheet)

### 1. Database Downtime

- Check Cloudflare Status page.
- Check D1 limits (storage/read/write).
- Restore from last daily backup if data corruption is suspected.

### 2. High 429 (Too Many Requests) Alerts

- Identify if it's a brute-force attack or a misconfigured merchant bot.
- Adjust `rate-limit.ts` presets if needed for specific IPs.

### 3. Sentry Explosion (High volume of errors)

- Rollback last deployment in Cloudflare Pages.
- Investigate `sentry.io` for the root cause.

---

> **Note:** Security is a continuous process, not a one-time setup. Stick to the Weekly routine for 99% safety.
