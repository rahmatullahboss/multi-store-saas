#!/bin/bash
# Scan for potential tenant leakage

echo "Checking for missing store_id filters..."
grep -r "where" app/routes | grep -v "store_id" | grep -v "storeId"

echo "\nChecking for direct param usage..."
grep -r "params.id" app/routes
