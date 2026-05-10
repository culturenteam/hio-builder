# ARCHITECTURE.md

## Data Flow

```
User types in chat
  → ChatSidebar component
    → POST to Supabase Edge Function /ai-command  { prompt, page_id }
      → Build context snapshot (current page sections)
      → Call Claude Haiku with tool declarations (see AI.md)
      → Claude returns typed tool_use block
      → Validate operation server-side
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
      → PATCH sections/reorder  { section_ids: string[] }
        → Supabase bulk update section.order
```

```
User changes style variant
  → Module click → StylePicker panel opens
    → User selects variant
      → Optimistic update in PageContext
      → PATCH sections/:id  { style_variant }
        → Supabase update
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
| `user.ts` | User, UserSettings |
| `ai.ts` | AIOperation union, all operation interfaces, AICommandRequest/Response |
| `api.ts` | APIResponse<T>, ErrorResponse |

### `src/modules/`
One folder per module type:
```
modules/
└── hero/
    ├── HeroModule.tsx          ← renderer component
    ├── HeroModule.module.css   ← 4 variant classes
    └── hero.defaults.ts        ← default content for new hero sections
```

### `src/components/`
```
components/
├── atoms/       ← Button, Input, Badge, Icon
├── molecules/   ← ChatMessage, ModuleCard, StylePicker, WidthSlider
└── organisms/   ← ChatSidebar, BuilderCanvas, PublicNav, ModuleToolbar
```

An atom has no child components. A molecule composes atoms. An organism composes
molecules and may hold local state. Pages compose organisms only.

### `src/context/`
- `PageContext.tsx` — sections array, loading state, optimistic updaters
- `AuthContext.tsx` — Supabase session, user object, sign in/out helpers

### `src/services/`
- `supabase.ts` — all Supabase queries (never call the client directly from components)
- `ai.ts` — `sendCommand(prompt, pageId)`, SYSTEM_PROMPT constant, tool declarations

### `src/hooks/`
- `usePage.ts` — consumes PageContext
- `useAuth.ts` — consumes AuthContext
- `useDrag.ts` — dnd-kit setup and reorder handler
- `useStylePicker.ts` — open/close state for the style panel

### `src/pages/`
Route-level only. No business logic — compose organisms.
```
pages/
├── Builder.tsx   ← authenticated builder (canvas + chat sidebar)
├── Public.tsx    ← public /:slug view
└── Auth.tsx      ← sign-in page
```

### `supabase/migrations/`
Named `NNN_description.sql` (NNN zero-padded: 001, 002, ...).
Never edit a committed migration — add a new one.

### `supabase/functions/`
Supabase Edge Functions (Deno runtime).
```
functions/
└── ai-command/
    └── index.ts   ← receives prompt, calls Claude, executes tool, returns result
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

Breaking this chain is not allowed.

---

## State Rules

- **Server state** (sections, page) → PageContext, fetched from Supabase.
- **UI state** (panel open, drag active) → local component state.
- **Auth state** → AuthContext.
- No external state library needed.
- Optimistic updates: update context immediately, roll back on error.

---

## Routing

React Router v6, client-side.

| Path | Component | Auth |
|---|---|---|
| `/` | Builder | Required |
| `/sign-in` | Auth | No |
| `/:slug` | Public | No |

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Anthropic API key lives in Supabase Edge Function secrets only.
It must never appear in the client bundle.
