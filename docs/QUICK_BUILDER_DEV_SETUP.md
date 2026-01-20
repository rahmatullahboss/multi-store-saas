# Quick Builder Dev Setup

Fast-track guide for builders and developers working on the Ozzyl landing page builder.

---

## 1. Prerequisites

### System Requirements
- **Node.js** 18+ (verify: `node -v`)
- **npm** or **pnpm** (npm comes with Node.js)
- **Cloudflare account** (free tier OK for dev)
- **Git** (for version control)

### Recommended VS Code Extensions
```
- ESLint (Microsoft) — Real-time linting feedback
- Prettier (Prettier) — Code formatting on save
- Tailwind CSS IntelliSense (Tailwind Labs) — Class autocomplete
- Thunder Client or REST Client — API testing
```

### Install Extensions Quick
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

---

## 2. Environment Setup

### Clone & Install
```bash
# Clone repo (or navigate to existing)
git clone <repo-url> ozzyl-dev
cd ozzyl-dev

# Install dependencies
npm install
```

### Configure Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your local values
# Minimum for local dev:
# - SESSION_SECRET=any-random-32-chars-string
# - CLOUDFLARE_ACCOUNT_ID=your-account-id
# - CLOUDFLARE_DATABASE_ID=your-db-id
# - CLOUDFLARE_API_TOKEN=your-api-token
```

### Required Env Variables Reference
| Variable | Purpose | Example |
|----------|---------|---------|
| `SESSION_SECRET` | Auth sessions (32+ chars) | `abc123...xyz789` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | `1a2b3c4d5e6f7g8h` |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID | `xyz-123-abc` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API auth | `Bearer token...` |
| `CLOUDFLARE_ZONE_ID` | DNS zone ID | `zone123...` |
| `RESEND_API_KEY` | Email service (optional) | `re_xxxx...` |
| `OPENROUTER_API_KEY` | AI features (optional) | `sk-or-xxxx...` |
| `APP_URL` | App base URL | `http://localhost:5174` |

### Setup Local Database
```bash
# Run migrations (creates tables in local D1)
npm run db:migrate:local

# Verify database
npm run db:studio  # Opens Drizzle Studio UI
```

### Start Development Server
```bash
# Terminal 1: Remix dev server (http://localhost:5173)
npm run dev

# Terminal 2 (optional): Wrangler Cloudflare Pages dev
npm run dev:wrangler
```

Access the app at `http://localhost:5173` after both servers start.

---

## 3. File Structure

### Builder Components Directory
```
app/components/landing-builder/
├── SectionManager.tsx          # Core editor UI (drag/drop sections)
├── AddSectionModal.tsx         # Section picker modal
├── AIGeneratorModal.tsx        # AI content generator
├── SEOPanel.tsx                # SEO meta editor
├── VersionHistory.tsx          # Undo/redo & history
├── LandingTemplateGallery.tsx  # Template picker
├── WhatsAppConfig.tsx          # WhatsApp integration
├── LandingFooter.tsx           # Footer builder
└── index.ts                    # Component exports
```

### Templates & Sections Directory
```
app/components/templates/
├── LandingPageTemplate.tsx     # Main landing page wrapper
├── StoreLayout.tsx             # Full store template
├── FullStoreTemplate.tsx       # Store + products
├── _core/                      # Shared section base
├── flash-sale/                 # Flash sale template sections
├── luxe/                       # Premium/luxury template
└── minimal-clean/              # Minimal template variant
```

### Page Builder Route
```
app/routes/
└── app.page-builder.tsx        # Landing pages list & management
                                # Redirects to builder.ozzyl.com for editing
```

### Database & Types
```
db/
├── schema.ts                   # Drizzle table definitions
├── types.ts                    # LandingConfig interface ⭐
├── migrations/                 # SQL migration files
└── seeds/                      # Seed data (e2e tests)
```

**Key Type: `LandingConfig`** (in `db/types.ts`)
```typescript
interface LandingConfig {
  sections: Section[];
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  testimonials?: Testimonial[];
  features?: Feature[];
  socialProof?: SocialProof;
  // ... more fields
}
```

### Documentation
```
docs/
├── QUICK_BUILDER_DEV_SETUP.md  # This file
├── QUICK_BUILDER_TECHNICAL_GUIDE.md
├── QUICK_BUILDER_TEMPLATE_GUIDE.md
├── QUICK_BUILDER_V2_SPEC.md
├── API_REFERENCE.md
└── ARCHITECTURE.md
```

---

## 4. Quick Commands

### Development
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Remix dev server |
| `npm run dev:wrangler` | Start Cloudflare Pages dev (Workers + D1) |
| `npm run build` | Build for production |
| `npm run db:studio` | Open Drizzle ORM UI (inspect data) |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format code with Prettier |

### Testing
| Command | Purpose |
|---------|---------|
| `npm run test` | Run unit tests |
| `npm run test:watch` | Watch mode for tests |
| `npm run e2e` | Run end-to-end tests |
| `npm run e2e:headed` | E2E with browser visible |
| `npm run test:all` | Lint + typecheck + tests |

### Database
| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate:local` | Run migrations locally |
| `npm run db:migrate:prod` | Run migrations in production |

### Deployment
| Command | Purpose |
|---------|---------|
| `npm run deploy` | Deploy main app to Cloudflare Pages |
| `cd apps/page-builder && npm run deploy` | Deploy builder worker separately |

---

## 5. Common Dev Workflows

### Add a New Section Template
1. Create folder: `app/components/templates/my-section/`
2. Add component: `MySectionComponent.tsx`
3. Register in section registry: `app/templates/registry.ts`
4. Add to template gallery modal

### Edit Page Builder UI
- Main editor: `app/components/landing-builder/SectionManager.tsx`
- Modals: `app/components/landing-builder/AddSectionModal.tsx`
- SEO panel: `app/components/landing-builder/SEOPanel.tsx`

### Add Database Field to Landing Pages
1. Update schema: `db/schema.ts` → `landingPages` table
2. Generate migration: `npm run db:generate`
3. Run migration: `npm run db:migrate:local`
4. Update `LandingConfig` type in `db/types.ts`
5. Update builder component to use new field

### Debug Page Builder Issues
```bash
# Check browser console for client errors
# Open DevTools: F12 or Cmd+Option+I

# Server logs in terminal (Remix dev)
# Look for error stacktraces

# Inspect database state
npm run db:studio

# Check environment variables loaded
# Look in browser Network tab for API responses
```

---

## 6. Getting Help

### Documentation Links
- **Architecture Overview**: `docs/ARCHITECTURE.md`
- **Builder Technical Details**: `docs/QUICK_BUILDER_TECHNICAL_GUIDE.md`
- **Template Customization**: `docs/QUICK_BUILDER_TEMPLATE_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Project Rules**: `.agent/rules/PROJECT_RULES.md`

### Key Coding Patterns
- **Always scope queries by `store_id`** (multi-tenant safety)
- **Use Remix `loader`/`action`** patterns (not `useEffect` for page data)
- **Use Zod validation** for all form submissions
- **Use `<OptimizedImage />`** (not raw `<img>`)
- **Use Tailwind** for styling + `lucide-react` icons

### Troubleshooting
| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules` & `package-lock.json`, retry |
| Dev server won't start | Check port 5173 free, kill other processes |
| Database errors | Run `npm run db:migrate:local` again |
| Env vars not loading | Verify `.env` in root, restart dev server |
| Type errors in IDE | Run `npm run typecheck`, check `tsconfig.json` |

### Where to Ask
- **Bug/Feature**: GitHub Issues
- **Architecture questions**: `docs/ARCHITECTURE.md` & team chat
- **Builder-specific**: `docs/QUICK_BUILDER_V2_SPEC.md`
- **Code style**: `.agent/rules/PROJECT_RULES.md`

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup `.env` file: `cp .env.example .env`
3. ✅ Initialize database: `npm run db:migrate:local`
4. ✅ Start dev: `npm run dev`
5. ✅ Open browser: `http://localhost:5173`
6. 📖 Read: `docs/QUICK_BUILDER_TECHNICAL_GUIDE.md`

Happy coding! 🚀
