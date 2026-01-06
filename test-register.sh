#!/bin/bash

# Test registration script to create a test store for AI testing

echo "Testing store registration..."

curl -X POST http://localhost:5174/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test User&email=test@example.com&password=password123&storeName=Test Store&subdomain=test-store"

echo ""
echo "Registration complete. Now testing AI chat..."
echo ""

# Test the AI chat with the newly created store
echo "Testing AI chat with store ID 1:"
curl -X POST http://localhost:5174/api/chat \
  -F "message=hello" \
  -F "storeId=1"

echo ""