---
name: "generate-ai-action"
description: "Convert natural language command to JSON action using LLM"
when_to_use: "When merchant types AI command in editor"
allowed-tools:
  ["Read", "Write", "APITools(claude-api:*)", "APITools(openai-api:*)"]
model: "claude-3-5-sonnet"
---

# AI Action Generation Process

## Step 1: Build Context

1. Get current store config (cached)
2. Load template schema `resources/action-schema.json`
3. Build AI context: store type, products, current page

## Step 2: Call LLM

```typescript
const prompt = `
STORE: ${store.name} (type: ${store.type})
CURRENT: ${currentSection}
COMMAND: "${merchantCommand}"
SCHEMA: ${JSON.stringify(schema)}

Generate JSON action.
`;
```

## Step 3: Validate

1. Check confidence > 0.8
2. Validate against schema
3. Check permissions (User owns store?)

## Step 4: Return

```json
{
  "action": "update_section",
  "sectionId": "hero_1",
  "updates": { "background": "#ff0000" },
  "confidence": 0.95
}
```

## Error Handling

If confidence < 0.8, return clarification request.
