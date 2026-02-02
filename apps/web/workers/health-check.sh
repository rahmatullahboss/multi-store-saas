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

# URLs
MAIN_APP_URL="https://multi-store-saas.ozzyl.workers.dev"
PAGE_BUILDER_URL="https://builder.ozzyl.com"

# Parse arguments
CHECK_WORKERS=true
CHECK_MAIN=true
CHECK_BUILDER=true

if [[ "$1" == "--workers" ]]; then
    CHECK_MAIN=false
    CHECK_BUILDER=false
elif [[ "$1" == "--main" ]]; then
    CHECK_WORKERS=false
fi

# Helper functions
check_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((HEALTHY++))
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    ((UNHEALTHY++))
}

check_warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
    ((WARNINGS++))
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
    
    # Check main app responds
    echo -e "${YELLOW}Testing: $MAIN_APP_URL/api/health${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "$MAIN_APP_URL/api/health" 2>/dev/null | grep -q "200"; then
        check_pass "Main app responding (HTTP 200)"
        
        # Get health response
        HEALTH_RESPONSE=$(curl -s "$MAIN_APP_URL/api/health" 2>/dev/null)
        echo -e "   ${GREEN}Response: $HEALTH_RESPONSE${NC}"
    else
        check_fail "Main app not responding or error"
        echo -e "   ${YELLOW}Check: wrangler tail in apps/web${NC}"
    fi
    
    # Check API returns JSON (not HTML)
    echo -e "${YELLOW}Testing API returns JSON...${NC}"
    API_RESPONSE=$(curl -s "$MAIN_APP_URL/api/health" 2>/dev/null)
    if echo "$API_RESPONSE" | grep -q "status"; then
        check_pass "API returns JSON correctly"
    else
        check_fail "API may be returning HTML (run_worker_first issue?)"
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
    ASSET_URL="$MAIN_APP_URL/assets"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ASSET_URL" 2>/dev/null || echo "000")
    
    if [[ "$STATUS" != "000" ]]; then
        check_pass "Asset endpoint accessible (HTTP $STATUS)"
    else
        check_warn "Could not verify assets (may need build)"
    fi
    
    echo ""
fi

# ============================================================================
# CHECK 5: DNS & Routing
# ============================================================================
if [[ "$CHECK_MAIN" == true ]]; then
    check_header "5. DNS & Routing Check"
    
    echo -e "${YELLOW}Checking DNS resolution...${NC}"
    
    # Check if domain resolves
    if nslookup multi-store-saas.ozzyl.workers.dev &>/dev/null; then
        check_pass "Main app DNS resolves"
    else
        check_warn "DNS lookup failed (may be network issue)"
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
