#!/bin/bash

# Helper to generate diagrams from mermaid files
# Requires: npm install -g @mermaid-js/mermaid-cli

INPUT=$1
OUTPUT="${INPUT%.*}.png"

if ! command -v mmdc &> /dev/null; then
    echo "Error: mermaid-cli (mmdc) is not installed."
    echo "Install it with: npm install -g @mermaid-js/mermaid-cli"
    exit 1
fi

if [ -z "$INPUT" ]; then
    echo "Usage: ./generate_diagram.sh [input_file.mmd]"
    exit 1
fi

echo "Generating diagram from $INPUT to $OUTPUT..."
mmdc -i "$INPUT" -o "$OUTPUT" -b transparent
echo "Done."
