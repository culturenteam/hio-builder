# ARCHITECTURE.md

## Product Model

hio is a multi-tenant page builder. Every user who signs up gets:
- A personal page builder at `hio-builder.netlify.app/` (their builder)
- A public page at `hio-builder.netlify.app/[slug]` (now) → `[slug].hio.space` (custom domain, Phase 6)
- A module access tier: `free` (4 module types) or `paid` (all 9)

### User Tiers

| Tier | Modules available |
|---|---|
| `free` | hero, bio, links, contact |
| `paid` | all 9 (+ services, calendar, gallery, testimonial, custom) |

Admins can also grant individual module overrides via `user_settings.module_overrides` (JSON array of extra ModuleType strings) without upgrading the whole tier.

### Admin panel

Route: `/admin` — only visible to users where `user_settings.is_admin = true`.

Admin capabilities:
- List all users (email, slug, tier, created_at, section count)
- Change a user's tier (free → paid)
- Set per-user module overrides
- Lock / disable accounts

### Public URL strategy

| Phase | Public URL |
|---|---|
| Now (Netlify) | `hio-builder.netlify.app/[slug]` |
| Custom domain | `[slug].hio.space` via wildcard DNS + Netlify Edge Function |

**Subdomain routing (Phase 6):**
- Add `*.hio.space` as a Netlify custom domain
- A Netlify Edge Function reads the `Host` header, extracts the subdomain,
  looks up the matching page by slug, and serves the SPA with the correct context.

---

## Data Flow

```
User types in chat
  → ChatSidebar component
    → POST to Supabase Edge Function /ai-command  { prompt, page_id }
      → Build context snapshot (current page sections)
      → Call Claude Haiku with tool declarations (see AI.md)
      → Claude returns typed tool_use block
      → Validate operation server-side (incl. tier check)
      → Execute mutation against Supabase
      → Return { ok: true, operation, message }
  → PageContext refreshes affected sections
  → Canvas re-renders changed modules
  → Confirmation message appended to chat
```

```
User drags module
  → Canvas (dnd-kit DndContext)
    → onDragEnd fires with new order array
      → Optimistic update in PageContext
      → reorderSections RPC  { page_id, updates: [{id, order}] }
        → Supabase bulk update section.order
```

```
User changes style variant
  → SectionCard toolbar → variant button click
    → Optimistic update in PageContext
    → PATCH sections/:id  { style_variant }
      → Supabase update
```

```
User adds module
  → Builder canvas → Add module picker
    → Tier check: only allowed ModuleTypes shown / selectable
    → INSERT sections (enforced by Supabase RLS + allowed_module_types())
    → Optimistic append in PageContext
```

---

## Folder Conventions

### `src/styles/`
- `tokens.css` — the only file with raw values (hex, px, ms).
- `global.css` — resets and base typography, references tokens only.

### `src/types/`
One file per domain. Import from the specific file, not a barrel.

| File | Contents |
|---|---|
| `module.ts` | ModuleType, StyleVariant, per-module content interfaces |
| `page.ts` | Page, Section, NavigationItem |
| `user.ts` | User, UserSettings, UserTier, FREE_MODULES, ALL_MODULES, getAllowedModules() |
| `ai.ts` | AIOperation union, all operation interfaces, AICommandRequest/Response |

### `src/components/`
```
components/
├── modules/       ← one .tsx + .module.css per module type
│   ├── HeroModule.tsx
│   ├── index.tsx  ← ModuleRenderer switch
│   └── ...
└── SectionCard/   ← drag wrapper + toolbar
```

### `src/context/`
- `PageContext.tsx` — sections array, loading state, optimistic updaters, addSection (tier-aware)
- `AuthContext.tsx` — Supabase session, user object, sign in/out helpers

### `src/services/`
- `supabase.ts` — all Supabase queries (never call the client directly from components)

### `src/hooks/`
- `usePage.ts` → re-exports `usePageContext`
- `useAuth.ts` → re-exports `useAuthContext`

### `src/pages/`
Route-level only. No business logic — compose organisms.
```
pages/
├── Builder.tsx   ← authenticated builder (canvas + chat sidebar)
├── Admin.tsx     ← admin user list + tier management  [Phase 4]
├── Public.tsx    ← public /[slug] view                [Phase 5]
└── Auth.tsx      ← sign-in page
```

### `supabase/migrations/`
Named `NNN_description.sql`. Never edit a committed migration — always add a new one.

| # | Description |
|---|---|
| 001 | Initial schema (user_settings, pages, sections, enums, RLS, triggers) |
| 002 | reorder_sections RPC function |
| 003 | Fix handle_new_user trigger with public. schema qualifiers |
| 004 | Add user_tier enum, tier + module_overrides columns, allowed_module_types() fn, sections INSERT RLS |

### `supabase/functions/`
Supabase Edge Functions (Deno runtime).
```
functions/
└── ai-command/
    └── index.ts   ← receives prompt, calls Claude Haiku, executes tool, returns result
```

---

## Component Import Hierarchy

| Layer | May import from |
|---|---|
| atoms | types, styles only |
| molecules | atoms, types, hooks |
| organisms | molecules, atoms, context, hooks, services |
| pages | organisms, context, hooks |
| modules | atoms, molecules, types (NOT other modules) |

---

## State Rules

- **Server state** (sections, page, user settings) → Context, fetched from Supabase
- **UI state** (panel open, drag active) → local component state
- **Auth state** → AuthContext
- No external state library needed
- Optimistic updates: update context immediately, roll back on error

---

## Routing

React Router v6, client-side.

| Path | Component | Auth | Role |
|---|---|---|---|
| `/` | Builder | Required | Any |
| `/sign-in` | Auth | No | — |
| `/admin` | Admin | Required | is_admin only |
| `/:slug` | Public | No | — |

---

## Module Access Enforcement

Enforced at two layers (defence in depth):

1. **Client** — `getAllowedModules(settings)` from `src/types/user.ts` filters the add-module picker. Locked modules shown greyed with a lock icon.
2. **Database** — Supabase RLS policy on `sections` INSERT calls `allowed_module_types()` (SECURITY DEFINER). Even if the client is bypassed, the insert is rejected.

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Anthropic API key lives in Supabase Edge Function secrets only.
It must never appear in the client bundle.
