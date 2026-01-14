#!/bin/bash

# Run E2E tests using Playwright
# Usage: ./run_e2e.sh [spec_file]

SPEC=$1

if [ -z "$SPEC" ]; then
    echo "Running all E2E tests..."
    npx playwright test
else
    echo "Running E2E tests for $SPEC..."
    npx playwright test "$SPEC"
fi
