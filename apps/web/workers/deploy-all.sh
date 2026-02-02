#!/bin/bash

# =============================================================================
# Deploy All DO Workers - Multi-Store SaaS
# =============================================================================
# 
# This script deploys all Durable Object workers in the correct order.
# Service bindings require workers to be deployed BEFORE the main app.
#
# Usage:
#   ./deploy-all.sh           # Deploy all workers
#   ./deploy-all.sh --dry-run # Show what would be deployed
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Worker directories (in deployment order)
# Order matters: deploy service workers first, then proxy
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

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE - No actual deployments will be made${NC}\n"
fi

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Multi-Store SaaS - DO Workers Deployment Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track results
DEPLOYED=()
FAILED=()
SKIPPED=()

# Function to deploy a single worker
deploy_worker() {
    local worker_name=$1
    local worker_path="${SCRIPT_DIR}/${worker_name}"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📦 Deploying: ${worker_name}${NC}"
    
    # Check if directory exists
    if [[ ! -d "$worker_path" ]]; then
        echo -e "${RED}   ❌ Directory not found: ${worker_path}${NC}"
        SKIPPED+=("$worker_name")
        return 1
    fi
    
    # Check if wrangler.toml exists
    if [[ ! -f "${worker_path}/wrangler.toml" ]]; then
        echo -e "${RED}   ❌ wrangler.toml not found${NC}"
        SKIPPED+=("$worker_name")
        return 1
    fi
    
    # Check if node_modules exists, if not run npm install
    if [[ ! -d "${worker_path}/node_modules" ]]; then
        echo -e "${YELLOW}   📥 Installing dependencies...${NC}"
        if [[ "$DRY_RUN" == false ]]; then
            (cd "$worker_path" && npm install --silent)
        else
            echo -e "${YELLOW}   [DRY RUN] Would run: npm install${NC}"
        fi
    fi
    
    # Deploy
    echo -e "${YELLOW}   🚀 Running wrangler deploy...${NC}"
    if [[ "$DRY_RUN" == false ]]; then
        if (cd "$worker_path" && npx wrangler deploy 2>&1); then
            echo -e "${GREEN}   ✅ ${worker_name} deployed successfully!${NC}"
            DEPLOYED+=("$worker_name")
            return 0
        else
            echo -e "${RED}   ❌ ${worker_name} deployment failed!${NC}"
            FAILED+=("$worker_name")
            return 1
        fi
    else
        echo -e "${YELLOW}   [DRY RUN] Would run: wrangler deploy in ${worker_path}${NC}"
        DEPLOYED+=("$worker_name")
        return 0
    fi
}

# Main deployment loop
echo -e "${GREEN}🚀 Starting deployment of ${#WORKERS[@]} workers...${NC}\n"

for worker in "${WORKERS[@]}"; do
    deploy_worker "$worker"
    echo ""
done

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    DEPLOYMENT SUMMARY                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ ${#DEPLOYED[@]} -gt 0 ]]; then
    echo -e "${GREEN}✅ Successfully deployed (${#DEPLOYED[@]}):${NC}"
    for w in "${DEPLOYED[@]}"; do
        echo -e "   • $w"
    done
    echo ""
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
    echo -e "${RED}❌ Failed (${#FAILED[@]}):${NC}"
    for w in "${FAILED[@]}"; do
        echo -e "   • $w"
    done
    echo ""
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
    echo -e "${YELLOW}⏭️  Skipped (${#SKIPPED[@]}):${NC}"
    for w in "${SKIPPED[@]}"; do
        echo -e "   • $w"
    done
    echo ""
fi

# Final status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ ${#FAILED[@]} -eq 0 ]]; then
    echo -e "${GREEN}🎉 All workers deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📌 Next step: Deploy the main app${NC}"
    echo -e "   cd apps/web && npm run deploy"
    exit 0
else
    echo -e "${RED}⚠️  Some workers failed to deploy. Please check the errors above.${NC}"
    exit 1
fi
