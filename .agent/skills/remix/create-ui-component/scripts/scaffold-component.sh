#!/bin/bash
# Usage: ./scaffold-component.sh ComponentName
NAME=$1
if [ -z "$NAME" ]; then echo "Usage: $0 ComponentName"; exit 1; fi
FILE="$NAME.tsx"
cat <<EOF > "$FILE"
import React, { forwardRef } from 'react';
import { cn } from '~/lib/utils'; 

interface ${NAME}Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const ${NAME} = forwardRef<HTMLDivElement, ${NAME}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
${NAME}.displayName = "${NAME}";
EOF
echo "Created $FILE"
