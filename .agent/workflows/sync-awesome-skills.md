---
description: Sync Antigravity Awesome Skills to the current project
---

This workflow syncs the skills from the central `antigravity-awesome-skills` repository to the current project's `.agent/skills` directory.

1. Ensure target directory exists
   // turbo
2. Create the directory if it doesn't exist

   ```bash
   mkdir -p .agent/skills
   ```

3. Sync the skills
   > [!NOTE]
   > This assumes the `antigravity-awesome-skills` repo is cloned at `/Users/rahmatullahzisan/Desktop/Dev/antigravity-awesome-skills`.

// turbo 4. Copy the skills

```bash
cp -R "/Users/rahmatullahzisan/Desktop/Dev/antigravity-awesome-skills/skills/"* ".agent/skills/"
```

5. Notify completion
   Done! All awesome skills are now available in this project.
