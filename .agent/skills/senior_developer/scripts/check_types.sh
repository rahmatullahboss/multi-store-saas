#!/bin/bash

# Run TypeScript compiler to check for type errors
echo "Running Type Check..."
npx tsc --noEmit --skipLibCheck

if [ $? -eq 0 ]; then
  echo "✅ No type errors found."
else
  echo "❌ Type errors found."
  exit 1
fi
