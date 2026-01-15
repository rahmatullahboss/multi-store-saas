---
name: "optimize-prompt"
description: "Optimize AI prompt for better accuracy and lower cost"
when_to_use: "When AI response quality is low or cost is high"
allowed-tools: ["Read", "Write"]
---

# Prompt Optimization Process

## Step 1: Analyze Current Prompt

1. Check token count (target: < 1000)
2. Identify ambiguous language
3. Look for missing context (Role, Goal, Format)

## Step 2: Apply Best Practices

1. Use system prompt for role definitions
2. Use user prompt for specific task context
3. **Few-Shot Prompting**: Add 2-3 examples (See `examples/few-shot-template.md`)
4. Chain-of-thought: "Think step by step"

## Step 3: Test

1. Run against test cases
2. Measure accuracy vs token cost
3. Iterate until > 90% accuracy

## Output

Provide optimized prompt template.
