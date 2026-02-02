#!/bin/bash

# =============================================================================
# Pre-Deployment Verification Script - Multi-Store SaaS
# =============================================================================
#
# This script verifies all configurations are correct before deployment.
# Run this before running deploy-all.sh or deploying the main app.
#
# Usage:
#   ./verify-deployment.sh           # Full verification
#   ./verify-deployment.sh --quick   # Quick check (workers only)
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
ERRORS=0
WARNINGS=0
PASSED=0

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Parse arguments
QUICK_MODE=false
if [[ "$1" == "--quick" ]]; then
    QUICK_MODE=true
    echo -e "${YELLOW}⚡ QUICK MODE - Workers only${NC}\n"
fi

# Helper functions
check_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    ((ERRORS++))
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
echo -e "${BLUE}║     Pre-Deployment Verification - Multi-Store SaaS        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# CHECK 1: Verify wrangler CLI is installed
# ============================================================================
check_header "1. Wrangler CLI Installation"

if command -v wrangler &> /dev/null; then
    WRANGLER_VERSION=$(wrangler --version 2>/dev/null | head -1)
    if [[ "$WRANGLER_VERSION" =~ ^4\. ]]; then
        check_pass "Wrangler v4.x installed: $WRANGLER_VERSION"
    else
        check_fail "Wrangler is not v4.x (found: $WRANGLER_VERSION)"
        echo -e "   ${YELLOW}Run: npm install -g wrangler${NC}"
    fi
else
    check_fail "Wrangler CLI not found"
    echo -e "   ${YELLOW}Install with: npm install -g wrangler${NC}"
fi

echo ""

# ============================================================================
# CHECK 2: Verify wrangler login
# ============================================================================
check_header "2. Wrangler Authentication"

if wrangler whoami &> /dev/null; then
    check_pass "Authenticated with Cloudflare"
    ACCOUNT_INFO=$(wrangler whoami 2>/dev/null | grep -E "Account|Email" | head -2)
    echo -e "   ${GREEN}$ACCOUNT_INFO${NC}"
else
    check_fail "Not authenticated with Cloudflare"
    echo -e "   ${YELLOW}Run: wrangler login${NC}"
fi

echo ""

# ============================================================================
# CHECK 3: Verify Workers Configuration
# ============================================================================
check_header "3. Workers Configuration"

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
    worker_path="${SCRIPT_DIR}/${worker}"
    
    # Check directory exists
    if [[ ! -d "$worker_path" ]]; then
        check_fail "Worker directory missing: $worker"
        continue
    fi
    
    # Check wrangler.toml exists
    if [[ ! -f "${worker_path}/wrangler.toml" ]]; then
        check_fail "wrangler.toml missing: $worker"
        continue
    fi
    
    # Check package.json exists
    if [[ ! -f "${worker_path}/package.json" ]]; then
        check_fail "package.json missing: $worker"
        continue
    fi
    
    # Check node_modules exists
    if [[ ! -d "${worker_path}/node_modules" ]]; then
        check_warn "node_modules missing: $worker (run npm install)"
    fi
    
    # Check compatibility_date is 2025-04-14
    if grep -q "compatibility_date = \"2025-04-14\"" "${worker_path}/wrangler.toml" 2>/dev/null; then
        check_pass "$worker - compatibility_date correct"
    else
        check_fail "$worker - compatibility_date should be 2025-04-14"
    fi
    
    # Check nodejs_compat flag
    if grep -q "compatibility_flags = \[\"nodejs_compat\"\]" "${worker_path}/wrangler.toml" 2>/dev/null; then
        : # Silent pass
    else
        check_warn "$worker - nodejs_compat flag recommended"
    fi
done

echo ""

# Skip remaining checks in quick mode
if [[ "$QUICK_MODE" == true ]]; then
    check_header "QUICK MODE - Skipping app checks"
    echo ""
else

    # ============================================================================
    # CHECK 4: Verify Main App Configuration
    # ============================================================================
    check_header "4. Main App (apps/web) Configuration"
    
    web_path="${PROJECT_ROOT}/apps/web"
    
    # Check wrangler.toml
    if [[ -f "${web_path}/wrangler.toml" ]]; then
        # Check run_worker_first
        if grep -q "run_worker_first" "${web_path}/wrangler.toml" 2>/dev/null; then
            check_pass "run_worker_first configured"
        else
            check_fail "run_worker_first missing - CRITICAL!"
        fi
        
        # Check ASSETS binding
        if grep -q "binding = \"ASSETS\"" "${web_path}/wrangler.toml" 2>/dev/null; then
            check_pass "ASSETS binding configured"
        else
            check_warn "ASSETS binding may be missing"
        fi
        
        # Check compatibility_date
        if grep -q "compatibility_date = \"2025-04-14\"" "${web_path}/wrangler.toml" 2>/dev/null; then
            check_pass "compatibility_date is 2025-04-14"
        else
            check_warn "compatibility_date should be 2025-04-14"
        fi
    else
        check_fail "Main app wrangler.toml not found"
    fi
    
    # Check for Pages dependencies
    if [[ -f "${web_path}/package.json" ]]; then
        if grep -q "@remix-run/cloudflare-pages" "${web_path}/package.json" 2>/dev/null; then
            check_fail "@remix-run/cloudflare-pages still in dependencies"
        else
            check_pass "No Pages dependencies"
        fi
        
        # Check vite-tsconfig-paths version
        if grep -q "vite-tsconfig-paths.*5\.1" "${web_path}/package.json" 2>/dev/null; then
            check_pass "vite-tsconfig-paths v5.1.x"
        else
            check_warn "vite-tsconfig-paths should be v5.1.x (not v6.x)"
        fi
    fi
    
    # Check functions directory doesn't exist
    if [[ -d "${web_path}/functions" ]]; then
        check_fail "functions/ directory still exists (Pages artifact)"
    else
        check_pass "No functions/ directory (good)"
    fi
    
    echo ""
    
    # ============================================================================
    # CHECK 5: Verify Page Builder Configuration
    # ============================================================================
    check_header "5. Page Builder (apps/page-builder) Configuration"
    
    builder_path="${PROJECT_ROOT}/apps/page-builder"
    
    if [[ -f "${builder_path}/wrangler.toml" ]]; then
        if grep -q "run_worker_first" "${builder_path}/wrangler.toml" 2>/dev/null; then
            check_pass "run_worker_first configured"
        else
            check_warn "run_worker_first may be missing"
        fi
        
        if grep -q "binding = \"ASSETS\"" "${builder_path}/wrangler.toml" 2>/dev/null; then
            check_pass "ASSETS binding configured"
        else
            check_warn "ASSETS binding may be missing"
        fi
    else
        check_warn "Page builder wrangler.toml not found"
    fi
    
    if [[ -d "${builder_path}/functions" ]]; then
        check_fail "Page builder functions/ directory still exists"
    else
        check_pass "No functions/ directory (good)"
    fi
    
    echo ""

fi

# ============================================================================
# CHECK 6: Verify Dependencies
# ============================================================================
check_header "6. Dependencies Check"

# Check main app node_modules
if [[ -d "${PROJECT_ROOT}/apps/web/node_modules" ]]; then
    check_pass "Main app dependencies installed"
else
    check_fail "Main app dependencies missing - run npm install"
fi

# Check for build directory
if [[ -d "${PROJECT_ROOT}/apps/web/build" ]]; then
    check_pass "Main app build exists"
else
    check_warn "Main app build missing - run npm run build"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
check_header "VERIFICATION SUMMARY"

echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "   1. Deploy workers: ${YELLOW}cd apps/web/workers && ./deploy-all.sh${NC}"
    if [[ "$QUICK_MODE" == false ]]; then
        echo -e "   2. Build main app: ${YELLOW}cd apps/web && npm run build${NC}"
        echo -e "   3. Deploy main app: ${YELLOW}wrangler deploy${NC}"
    fi
    exit 0
else
    echo -e "${RED}⚠️  Found $ERRORS error(s). Please fix before deploying.${NC}"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo -e "   • Install dependencies: ${YELLOW}npm install${NC}"
    echo -e "   • Update wrangler: ${YELLOW}npm install -g wrangler${NC}"
    echo -e "   • Login to Cloudflare: ${YELLOW}wrangler login${NC}"
    exit 1
fi
