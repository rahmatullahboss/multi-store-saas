---
trigger: always_on
---

## Workflow Rules (Remix + Cloudflare Optimized)

1. **Commit after change:** Ensure atomic commits for every feature or fix.

2. **Always use Context7 MCP server:** Fetch latest docs when needed to avoid outdated code.

3. **Always create reusable components:** Extract repeated UI patterns into modular components.

4. **Icons:** Use **`lucide-react`** (Project standard) for consistent, lightweight SVGs.

5. **Styling:** Always use **Tailwind CSS** (v4 or v3.4 as configured).

6. **State Management:**

   - Use `useState`/`useReducer` for local UI state (e.g., open/close modal).
   - Use **URL Search Params** (`useSearchParams`) for global state like filters, tabs, and pagination (Remix best practice).

7. **Routing:** Use **Remix File-based Routing**. Use `<Link>` or `useNavigate` for client-side navigation.

8. **Data Fetching:**

   - **READ:** Always use Remix `loader` + `useLoaderData` for initial data.
   - **WRITE:** Always use Remix `action` + `<Form>` or `useFetcher` for mutations.
   - **Avoid:** Do NOT use `useEffect` or `React Query` for fetching page data (unless strictly necessary for client-only updates).

9. **Forms:** Use Remix `<Form>` component. It handles loading states and revalidation automatically.

10. **Notifications:** Use `react-toastify` or `sonner` for user feedback.

11. **SEO:** Use the native Remix `meta` export function for title and meta tags.

12. **Images:** Use the custom `<OptimizedImage />` component (Cloudinary integration) instead of standard `<img>` tags for performance.

13. **Documentation:** Always update `DEVELOPMENT_ROADMAP.md` after completing a phase.
