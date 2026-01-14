#!/bin/bash

# Helper to start git bisect
# Usage: ./git_bisect.sh [good_commit] [bad_commit]

GOOD=$1
BAD=$2

if [ -z "$GOOD" ] || [ -z "$BAD" ]; then
  echo "Usage: ./git_bisect.sh [good_commit_hash] [bad_commit_hash]"
  echo "Find a commit where things worked (good) and where they broke (bad)."
  exit 1
fi

echo "Starting git bisect..."
echo "Good: $GOOD"
echo "Bad: $BAD"

git bisect start
git bisect bad "$BAD"
git bisect good "$GOOD"

echo "Bisect started. Git has checked out a middle commit."
echo "Test functionality. If broken, run 'git bisect bad'. If working, run 'git bisect good'."
echo "Repeat until the bad commit is found."
