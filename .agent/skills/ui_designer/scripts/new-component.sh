#!/bin/bash

# Usage: ./new-component.sh ComponentName

NAME=$1
if [ -z "$NAME" ]; then
  echo "Usage: $0 ComponentName"
  exit 1
fi

FILE="$NAME.tsx"

if [ -f "$FILE" ]; then
  echo "Error: $FILE already exists."
  exit 1
fi

cat <<EOF > "$FILE"
import React from 'react';
import { cn } from '~/lib/utils'; // Adjust path if needed

interface ${NAME}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${NAME}({ className, children }: ${NAME}Props) {
  return (
    <div className={cn("relative", className)}>
      {/* Component content */}
      {children || '${NAME}'}
    </div>
  );
}
EOF

echo "Created $FILE"
