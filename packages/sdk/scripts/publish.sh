#!/bin/bash
# Pre-publish checklist for @ozzyl/sdk
set -e

echo '🔍 Running type check...'
npm run typecheck

echo '🧪 Running tests...'
npm test

echo '🏗️ Building...'
npm run build

echo '📦 Package contents:'
npm pack --dry-run

echo '🚀 Ready to publish! Run: npm publish --access public'
