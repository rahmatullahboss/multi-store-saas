---
description: Stitch design
---

# Google Stitch Design Workflow

This guide explains how to use the Google Stitch MCP server to generate UI designs and code directly within your AI assistant.

## Prerequisites

1.  **Stitch MCP Server Configured:** Ensure your `mcp_config.json` includes the `stitch` server with a valid API key.
2.  **Restart:** You must restart your AI assistant (e.g., Claude Code, Antigravity) after configuring the server for changes to take effect.

## Available Tools

Once connected, the following tools should be available:

- `stitch_list_projects`: List your existing Stitch projects.
- `stitch_get_project`: Retrieve details of a specific project.
- `stitch_list_screens`: List screens within a project.
- `stitch_get_screen`: Get details of a specific screen.
- `stitch_generate_screen_from_text`: **(Key Feature)** Generate a new screen design from a text description.

## Workflow: Generating a New Screen

1.  **Describe your intent:**
    Ask the AI to generate a screen. Be descriptive!

    > "Generate a login screen for a medical app with a clean, blue-themed design using Stitch."

2.  **The AI will use `stitch_generate_screen_from_text`:**
    It will send your prompt to Google Stitch.

3.  **Review the Result:**
    The tool will return a URL to the generated design in Stitch and potentially the React/HTML code.

4.  **Refine:**
    You can ask for changes or iterate on the design.

## Example Prompts

- "Create a dashboard for a SaaS analytics platform with a sidebar and data visualization widgets."
- "Design a mobile-first product detail page for an e-commerce fashion store."
- "Generate a settings page for a user profile with sections for security, notifications, and billing."

## Troubleshooting

- **Tool not found?** Restart your agent.
- **API Error?** Check your `STITCH_API_KEY` in `mcp_config.json`.
