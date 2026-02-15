---
description: Consult with specialized subagents (Database, Frontend, QA)
---

# Consult Workflow

This workflow allows you to consult with specialized subagents for expert advice on specific topics.

## Usage

```bash
/consult [subagent] [question]
```

### Available Subagents

- **database**: `database-architect.md`
- **frontend**: `frontend-specialist.md`
- **qa**: `qa-engineer.md`

## Process

1. **Identify the Subagent**: Based on the first argument, load the appropriate subagent definition.
2. **Load Context**: Read the relevant documentation or files if provided in the prompt.
3. **Prompt the Subagent**: Send the user's question to the subagent, utilizing its specific persona and capabilities.
4. **Display Response**: Show the subagent's advice to the user.

## Example

```bash
/consult database "How should I model a many-to-many relationship between Products and Tags?"
/consult frontend "Review this component for accessibility issues."
/consult qa "What is the best strategy for testing this payment flow?"
```

## Implementation Details

- The subagent definitions are located in `.agent/subagents/`.
- This workflow manually loads the content of the selected subagent file and prepends it to the system prompt for the next turn.
- **Note**: This is a conceptual workflow. In practice, you (the agent) act as the router. When you see `/consult`, you should:
  1. Read the corresponding subagent file.
  2. Adopt the persona described in the file.
  3. Answer the user's question.
