---
stepsCompleted: [1]
inputDocuments: []
session_topic: 'Review "React Template Normal" System and Landing Page for MVP'
session_goals: 'Validate MVP architecture and brainstorm Landing Page integration'
selected_approach: ''
techniques_used: []
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Boss
**Date:** 2026-02-19

## Session Overview

**Topic:** Review "React Template Normal" System and Landing Page for MVP
**Goals:** Validate MVP architecture and brainstorm Landing Page integration

### Context Guidance

I have analyzed your **active** codebase (ignoring the archived Shopify 2.0 system):

1.  **Current Theme System ("React Template Normal"):**
    - **Structure:** Pure React components (e.g., `StarterStoreTemplate`, `LuxeBoutiqueTemplate`) loaded via `store-registry.ts`.
    - **Config:** Customization happens via a `config` prop passed to these components.
    - **Pros:** Simple, type-safe, easy to debug, fast performance (no heavy engine).
    - **Cons:** Harder to add "drag-and-drop" sections later without rebuilding the engine; adding a new theme requires a code deploy.

2.  **Current Landing Page System (`LandingPageTemplate.tsx`):**
    - **Structure:** A dispatcher that loads a specific template (e.g., `Rush`) based on ID.
    - **Features:** Wraps templates with `CustomSectionRenderer` (for custom HTML injections) and `CheckoutModal`.
    - **Disconnect:** It feels like a separate system from the Store Templates, though they share some mechanics.

### Session Setup

To move forward, we need to answer two key questions:

1.  **MVP Validation:** Are you happy keeping the "Hardcoded React Templates" approach for the next 3-6 months? (It allows you to move fast now, but makes a "Theme Store" for 3rd party devs harder later).

### GrapesJS vs. "Page Builder v2" Investigation

You mentioned a **GrapesJS Builder**. I investigated the codebase:

1.  **GrapesJS Status:** I found config files in `app/lib/grapesjs`, but **NO** active editor components or routes using them. It appears to be dormant or incomplete code.
2.  **"Page Builder v2" Discovery:** Your current Landing Page system is actually using a different engine located in `app/lib/page-builder`.
    - **Rich Templates:** I found very high-quality templates here (`tech-ultra`, `awwwards-2025`, `flash-sale`) defined in `templates.ts`.
    - **Structure:** It uses a structured JSON format (`sections` array with `props`), which is modern and robust.
    - **Active:** This is what powers your `/landing-template-preview` routes.

### Updated Strategy Proposal

Given this, I strongly recommend **IGNORING** the GrapesJS code for now. Your "Page Builder v2" is superior because:

1.  **It's Native:** Uses your existing React components (`SectionRenderer`).
2.  **It's Active:** Already wired up to your preview routes.
3.  **It's High Quality:** The templates I saw (`Tech Ultra`, `Awwwards`) are visually impressive.

**The Real Decision:**
We should double down on this **"Page Builder v2"** system.

- **For MVP:** Users select a high-quality preset (like 'Gadget Pro').
- **For Future:** We build a UI to let users reorder these specific sections (Drag & Drop), rather than importing a heavy 3rd party tool like GrapesJS.
