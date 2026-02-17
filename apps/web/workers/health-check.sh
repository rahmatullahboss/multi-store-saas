#!/bin/bash

# =============================================================================
# Post-Deployment Health Check - Multi-Store SaaS
# =============================================================================
#
# This script verifies all components are healthy after deployment.
# Run this after deploying all workers and the main app.
#
# Usage:
#   ./health-check.sh              # Full health check
#   ./health-check.sh --workers    # Check workers only
#   ./health-check.sh --main       # Check main app only
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
HEALTHY=0
UNHEALTHY=0
WARNINGS=0

# URLs (override via env for staging/prod/custom domains)
# Examples:
#   MAIN_APP_URL="https://app.ozzyl.com" HEALTH_CHECK_TOKEN="..." bash ./workers/health-check.sh --main
#   MAIN_APP_FALLBACK_URL="https://multi-store-saas.rahmatullahzisan.workers.dev" bash ./workers/health-check.sh --main
DEFAULT_MAIN_APP_URL="https://app.ozzyl.com"
DEFAULT_MAIN_APP_FALLBACK_URL="https://multi-store-saas.rahmatullahzisan.workers.dev"
DEFAULT_PAGE_BUILDER_URL="https://builder.ozzyl.com"
DEFAULT_HEALTH_ENDPOINT="/api/healthz"

MAIN_APP_URL="${MAIN_APP_URL:-$DEFAULT_MAIN_APP_URL}"
MAIN_APP_FALLBACK_URL="${MAIN_APP_FALLBACK_URL:-$DEFAULT_MAIN_APP_FALLBACK_URL}"
PAGE_BUILDER_URL="${PAGE_BUILDER_URL:-$DEFAULT_PAGE_BUILDER_URL}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-$DEFAULT_HEALTH_ENDPOINT}"
HEALTH_CHECK_TOKEN="${HEALTH_CHECK_TOKEN:-}"

# Parse arguments
CHECK_WORKERS=true
CHECK_MAIN=true
CHECK_BUILDER=true

if [[ "$1" == "--workers" ]]; then
    CHECK_MAIN=false
    CHECK_BUILDER=false
elif [[ "$1" == "--main" ]]; then
    CHECK_WORKERS=false
    CHECK_BUILDER=false
fi

# Helper functions
check_pass() {
    echo -e "${GREEN}✅${NC} $1"
    HEALTHY=$((HEALTHY + 1))
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    UNHEALTHY=$((UNHEALTHY + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

check_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Post-Deployment Health Check - Multi-Store SaaS       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# CHECK 1: Main App Health
# ============================================================================
if [[ "$CHECK_MAIN" == true ]]; then
    check_header "1. Main App Health Check"

    if [[ -n "$HEALTH_CHECK_TOKEN" ]]; then
        TOKEN_HEADERS=(-H "x-health-token: $HEALTH_CHECK_TOKEN")
    else
        TOKEN_HEADERS=()
    fi

    PRIMARY_URL="${MAIN_APP_URL}${HEALTH_ENDPOINT}"
    FALLBACK_URL="${MAIN_APP_FALLBACK_URL}${HEALTH_ENDPOINT}"

    echo -e "${YELLOW}Testing primary health URL: $PRIMARY_URL${NC}"
    PRIMARY_HEADERS=$(mktemp)
    PRIMARY_BODY=$(mktemp)
    PRIMARY_STATUS=$(curl -sS -D "$PRIMARY_HEADERS" -o "$PRIMARY_BODY" -w "%{http_code}" "${TOKEN_HEADERS[@]}" "$PRIMARY_URL" 2>/dev/null || echo "000")
    PRIMARY_CHALLENGED=false

    if [[ "$PRIMARY_STATUS" == "200" ]]; then
        check_pass "Main app health responding (HTTP 200)"
        echo -e "   ${GREEN}Response: $(cat "$PRIMARY_BODY")${NC}"
    else
        if grep -qi "cf-mitigated: challenge" "$PRIMARY_HEADERS"; then
            PRIMARY_CHALLENGED=true
            check_warn "Primary domain is challenge-protected for this client (expected with Cloudflare bot/challenge rules)"
        else
            check_warn "Primary health check returned HTTP $PRIMARY_STATUS"
        fi

        echo -e "${YELLOW}Testing fallback health URL: $FALLBACK_URL${NC}"
        FALLBACK_HEADERS=$(mktemp)
        FALLBACK_BODY=$(mktemp)
        FALLBACK_STATUS=$(curl -sS -D "$FALLBACK_HEADERS" -o "$FALLBACK_BODY" -w "%{http_code}" "${TOKEN_HEADERS[@]}" "$FALLBACK_URL" 2>/dev/null || echo "000")

        if [[ "$FALLBACK_STATUS" == "200" ]]; then
            check_pass "Fallback health responding (HTTP 200)"
            echo -e "   ${GREEN}Response: $(cat "$FALLBACK_BODY")${NC}"
        else
            if [[ "$PRIMARY_CHALLENGED" == true ]]; then
                check_warn "Could not validate via fallback while primary is challenge-protected (primary=$PRIMARY_STATUS, fallback=$FALLBACK_STATUS)"
            else
                check_fail "Health endpoint failed on both primary and fallback (primary=$PRIMARY_STATUS, fallback=$FALLBACK_STATUS)"
                echo -e "   ${YELLOW}Check: wrangler tail in apps/web${NC}"
            fi
        fi
    fi

    # Check API returns JSON (not HTML/challenge page)
    if grep -q '"status"' "$PRIMARY_BODY" 2>/dev/null; then
        check_pass "Primary health endpoint returns JSON"
    elif [[ -f "${FALLBACK_BODY:-}" ]] && grep -q '"status"' "$FALLBACK_BODY" 2>/dev/null; then
        check_pass "Fallback health endpoint returns JSON"
    elif [[ "$PRIMARY_CHALLENGED" == true ]]; then
        check_warn "JSON payload could not be verified because primary endpoint is challenge-protected"
    else
        check_fail "Health endpoint did not return expected JSON payload"
    fi
    
    echo ""
fi

# ============================================================================
# CHECK 2: Page Builder Health
# ============================================================================
if [[ "$CHECK_BUILDER" == true ]]; then
    check_header "2. Page Builder Health Check"
    
    echo -e "${YELLOW}Testing: $PAGE_BUILDER_URL${NC}"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PAGE_BUILDER_URL" 2>/dev/null)
    
    if [[ "$STATUS" == "200" ]] || [[ "$STATUS" == "302" ]]; then
        check_pass "Page builder responding (HTTP $STATUS)"
    else
        check_fail "Page builder not responding properly (HTTP $STATUS)"
    fi
    
    echo ""
fi

# ============================================================================
# CHECK 3: Workers Health (via Service Bindings)
# ============================================================================
if [[ "$CHECK_WORKERS" == true ]]; then
    check_header "3. Service Workers Health Check"
    
    # Workers are accessed via service bindings through the main app
    # Check if we can verify they're working
    
    echo -e "${YELLOW}Testing service bindings via main app...${NC}"
    
    # Try to access a route that uses service bindings
    echo -e "   ${BLUE}Note: Service bindings tested through main app${NC}"
    echo -e "   ${BLUE}Manual check: wrangler tail in each worker${NC}"
    
    WORKERS=(
        "order-processor"
        "cart-processor"
        "checkout-lock"
        "rate-limiter"
        "store-config"
        "editor-state"
        "pdf-generator"
        "webhook-dispatcher"
        "subdomain-proxy"
    )
    
    for worker in "${WORKERS[@]}"; do
        echo -e "   ${YELLOW}Checking $worker...${NC}"
        # We can't directly health check workers, but we can check they're deployed
        echo -e "      ${BLUE}Run: cd workers/$worker && wrangler tail${NC}"
    done
    
    check_warn "Manual verification required for workers"
    
    echo ""
fi

# ============================================================================
# CHECK 4: Static Assets
# ============================================================================
if [[ "$CHECK_MAIN" == true ]]; then
    check_header "4. Static Assets Check"
    
    echo -e "${YELLOW}Testing static asset loading...${NC}"
    
    # Try to load a CSS or JS file
    # NOTE: Use `/assets/` (with trailing slash) to avoid tenant resolution paths like `/assets`
    # which can return JSON 404 in multi-tenant mode. We accept 404 here because assets are hashed
    # and we don't know a specific filename without parsing HTML.
    ASSET_URL="$MAIN_APP_URL/assets/"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ASSET_URL" 2>/dev/null || echo "000")
    
    if [[ "$STATUS" == "200" ]] || [[ "$STATUS" == "204" ]] || [[ "$STATUS" == "304" ]] || [[ "$STATUS" == "404" ]]; then
        check_pass "Asset endpoint reachable (HTTP $STATUS)"
    elif [[ "$STATUS" == "000" ]]; then
        check_warn "Could not verify assets (network error)"
    elif [[ "$STATUS" =~ ^5 ]]; then
        check_fail "Asset endpoint error (HTTP $STATUS)"
    else
        check_warn "Unexpected asset status (HTTP $STATUS)"
    fi
    
    echo ""
fi

# ============================================================================
# CHECK 5: DNS & Routing
# ============================================================================
if [[ "$CHECK_MAIN" == true ]]; then
    check_header "5. DNS & Routing Check"
    
    echo -e "${YELLOW}Checking DNS resolution...${NC}"
    PRIMARY_HOST=$(echo "$MAIN_APP_URL" | sed -E 's#^https?://([^/]+).*$#\1#')
    FALLBACK_HOST=$(echo "$MAIN_APP_FALLBACK_URL" | sed -E 's#^https?://([^/]+).*$#\1#')
    
    # Check if domains resolve
    if nslookup "$PRIMARY_HOST" &>/dev/null; then
        check_pass "Primary app DNS resolves ($PRIMARY_HOST)"
    else
        check_warn "Primary DNS lookup failed ($PRIMARY_HOST)"
    fi

    if nslookup "$FALLBACK_HOST" &>/dev/null; then
        check_pass "Fallback app DNS resolves ($FALLBACK_HOST)"
    else
        check_warn "Fallback DNS lookup failed ($FALLBACK_HOST)"
    fi
    
    if nslookup builder.ozzyl.com &>/dev/null; then
        check_pass "Page builder DNS resolves"
    else
        check_warn "Page builder DNS lookup failed"
    fi
    
    echo ""
fi

# ============================================================================
# SUMMARY
# ============================================================================
check_header "HEALTH CHECK SUMMARY"

echo -e "${GREEN}✅ Healthy: $HEALTHY${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Unhealthy: $UNHEALTHY${NC}"
echo ""

if [[ $UNHEALTHY -eq 0 ]]; then
    echo -e "${GREEN}🎉 Deployment appears healthy!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "   • Monitor logs: ${YELLOW}wrangler tail${NC}"
    echo -e "   • Check analytics in Cloudflare Dashboard"
    echo -e "   • Test user flows manually"
    exit 0
else
    echo -e "${RED}⚠️  Found $UNHEALTHY issue(s). Please investigate.${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "   1. Check logs: ${YELLOW}wrangler tail${NC}"
    echo -e "   2. Verify environment variables in Dashboard"
    echo -e "   3. Check service bindings are configured"
    echo -e "   4. Ensure all workers deployed successfully"
    exit 1
fi
