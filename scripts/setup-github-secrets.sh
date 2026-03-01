#!/bin/bash
# ============================================================================
# GitHub Secrets Setup for CI/CD Pipeline
# Run this ONCE to configure all required GitHub secrets
#
# Prerequisites:
#   1. Install GitHub CLI: https://cli.github.com/
#   2. Run: gh auth login
#   3. Then run this script: bash scripts/setup-github-secrets.sh
# ============================================================================

set -e

REPO="rahmatullahboss/multi-store-saas"
CLOUDFLARE_ACCOUNT_ID="474078d5f990169d7dadf4e1df83214a"

echo "🔑 Setting up GitHub Secrets for CI/CD pipeline..."
echo "Repo: $REPO"
echo ""

# ── CLOUDFLARE_ACCOUNT_ID (not sensitive, can be a variable) ─────────────────
echo "Setting CLOUDFLARE_ACCOUNT_ID..."
gh secret set CLOUDFLARE_ACCOUNT_ID \
  --repo "$REPO" \
  --body "$CLOUDFLARE_ACCOUNT_ID"
echo "✅ CLOUDFLARE_ACCOUNT_ID set"

# ── CLOUDFLARE_API_TOKEN ──────────────────────────────────────────────────────
echo ""
echo "📋 CLOUDFLARE_API_TOKEN — Create one at:"
echo "   https://dash.cloudflare.com/profile/api-tokens"
echo "   Permissions needed: Workers Scripts:Edit, D1:Edit, Workers KV:Edit"
echo ""
read -p "Paste your Cloudflare API Token: " CF_TOKEN
gh secret set CLOUDFLARE_API_TOKEN \
  --repo "$REPO" \
  --body "$CF_TOKEN"
echo "✅ CLOUDFLARE_API_TOKEN set"

# ── HEALTH_CHECK_TOKEN ────────────────────────────────────────────────────────
echo ""
echo "📋 HEALTH_CHECK_TOKEN — Must match the value set with:"
echo "   wrangler secret put HEALTH_CHECK_TOKEN"
echo ""
read -p "Paste your HEALTH_CHECK_TOKEN: " HEALTH_TOKEN
gh secret set HEALTH_CHECK_TOKEN \
  --repo "$REPO" \
  --body "$HEALTH_TOKEN"
echo "✅ HEALTH_CHECK_TOKEN set"

# ── GitHub Environment Variables (not secrets — URLs are public) ──────────────
echo ""
echo "Setting environment URLs..."

# Staging URL
gh variable set STAGING_URL \
  --repo "$REPO" \
  --env staging \
  --body "https://multi-store-saas-staging.rahmatullahzisan.workers.dev" 2>/dev/null || \
gh variable set STAGING_URL \
  --repo "$REPO" \
  --body "https://multi-store-saas-staging.rahmatullahzisan.workers.dev"
echo "✅ STAGING_URL set"

# Production URL
gh variable set PRODUCTION_URL \
  --repo "$REPO" \
  --env production \
  --body "https://app.ozzyl.com" 2>/dev/null || \
gh variable set PRODUCTION_URL \
  --repo "$REPO" \
  --body "https://app.ozzyl.com"
echo "✅ PRODUCTION_URL set"

echo ""
echo "🎉 All secrets configured! Your CI/CD pipeline is ready."
echo ""
echo "Pipeline URL: https://github.com/$REPO/actions"
echo ""
echo "What happens on every push to main/master:"
echo "  1. ✅ Validate (typecheck + tests + security)"
echo "  2. 🏗️  Build"
echo "  3. 🚀 Deploy → Staging"
echo "  4. 🏥 Health check staging"
echo "  5. 🚀 Deploy → Production"
echo "  6. 🏥 Health check production"
echo "  7. 🔄 Auto-rollback if production health check fails"
