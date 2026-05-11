# CLAUDE.md — hio-builder

Read this fully before touching any file. Every rule here overrides default behaviour.

---

## What This Is

**hio-builder** — a modular, AI-powered personal page builder. Live at **https://build.hio.space**.

Users compose a page from 9 module types, drag to reorder, pick style variants, and use an AI
chat sidebar to edit copy by natural language. Each user gets a public page at `build.hio.space/[slug]`.

Stack: **Vite + React 18.3 + TypeScript + Supabase + Claude Haiku 4.5 (Anthropic)**  
Routing: **React Router v7**

---

## The Non-Negotiables

1. **Never use raw values in components.** Every colour, spacing, radius, shadow, font size
   must reference a CSS custom property from `src/styles/tokens.css`. No hex, no `px` values
   inline.

2. **Never use the `any` type.** All data shapes live in `src/types/`. Extend them, don't bypass.

3. **Never add a module type without updating `docs/MODULES.md`.** The module registry is the
   single source of truth. Component, type definition, and DB enum must all match.

4. **Never write an AI tool without updating `docs/AI.md`.** Tool declarations in the code
   must match the spec in that file exactly.

5. **Never edit Supabase schema ad-hoc.** All schema changes go through a numbered migration
   file in `supabase/migrations/`. The current latest is `009_rls_fixes_and_catchup.sql`.

6. **Always commit before running any generator or scaffolder.** Scaffolders delete uncommitted
   files. This happened once already during initial Vite setup.

---

## File Structure (actual)

```
/
├── docs/
│   ├── ARCHITECTURE.md   data flow, folder conventions
│   ├── DESIGN.md         design system: tokens, variants
│   ├── MODULES.md        module registry (source of truth)
│   ├── AI.md             Claude tool declarations, system prompt spec
│   └── DATABASE.md       Supabase schema, RLS, migration conventions
├── src/
│   ├── styles/
│   │   ├── tokens.css    ALL CSS custom properties — no raw values anywhere else
│   │   └── global.css    resets + base styles, references tokens only
│   ├── types/
│   │   ├── module.ts     ModuleType, StyleVariant, per-module content interfaces
│   │   ├── page.ts       Page, Section, NavigationItem
│   │   ├── user.ts       UserSettings, UserTier, FREE_MODULES, ALL_MODULES
│   │   └── ai.ts         AI message/tool types
│   ├── components/
│   │   ├── modules/      one .tsx + .module.css per module type (9 total)
│   │   │   └── index.tsx ModuleRenderer dispatch switch
│   │   ├── SectionCard/  builder card (drag handle + toolbar + module)
│   │   └── ChatSidebar/  AI chat UI
│   ├── context/
│   │   ├── PageContext.tsx  sections, settings, CRUD with optimistic rollback
│   │   └── AuthContext.tsx  session state
│   ├── services/
│   │   ├── supabase.ts   all DB calls — returns typed results, never swallows errors silently
│   │   └── ai.ts         system prompt + sendCommand()
│   ├── hooks/
│   │   ├── usePage.ts    re-export of usePageContext
│   │   └── useAuth.ts    re-export of useAuthContext
│   └── pages/
│       ├── Builder.tsx   authenticated builder view
│       ├── PublicPage.tsx  /:slug public read-only view
│       ├── Admin.tsx     /admin user management (admin only)
│       └── Auth.tsx      /sign-in
├── supabase/
│   ├── migrations/       001–009 (see docs/DATABASE.md)
│   └── functions/
│       └── ai-command/   Deno Edge Function, Claude Haiku, ANTHROPIC_API_KEY secret
├── CLAUDE.md             this file
└── index.html
```

---

## All Phases — Shipped

| Phase | Description |
|---|---|
| 0 — Foundation | Docs, design system, types, scaffold |
| 1 — Infrastructure | Supabase + Google OAuth + AuthContext + PageContext |
| 2 — Builder Canvas | 9 module renderers, drag-to-reorder (dnd-kit), SectionCard toolbar |
| 3 — AI Chat | Claude Haiku via Edge Function, 9 tools, prompt caching |
| 4 — Admin Panel | `/admin` — user list, tier toggle, module overrides, lock |
| 5 — Public Page | `/:slug` read-only view, public RLS, 404 vs 500 distinction |

---

## Token Usage Rules

```css
/* CORRECT */
background: var(--surface-base);
color: var(--text-primary);
gap: var(--space-4);
border-radius: var(--radius-sm);

/* WRONG */
background: #ffffff;
color: #111;
gap: 16px;
border-radius: 4px;
```

---

## Component Rules

- One component per file, filename matches component name exactly.
- Named exports only — no default exports.
- Styles via CSS Modules (`Component.module.css`) using token vars.
- Comments only when the WHY is non-obvious.

---

## Optimistic Update Pattern

All PageContext mutations follow: snapshot → apply optimistically → await DB → rollback on failure.
Functions return `boolean` (true = saved, false = rolled back). Do not change this pattern.

---

## AI Chat Rules

- All AI operations are typed. See `docs/AI.md`.
- AI may only call declared tools — no free-form mutations.
- Every tool call validated server-side before executing against Supabase.
- System prompt lives in `src/services/ai.ts`.
- Edge Function uses `service_role` client for mutations — acceptable today because all tools
  only update content fields. If a tool ever inserts sections, add tier-gate check in `executeTool()`.

---

## Deployment

- **Live URL:** https://build.hio.space (also https://hio-builder.netlify.app)
- **Deploy:** `git push origin main` → Netlify auto-builds from GitHub
- **Supabase project:** `yfvqmzaqhayveqllchuh`
- **Netlify site ID:** `9a001066-8b8c-410a-afe7-96a7eb4bbf1d`
- **Supabase Auth redirect URLs:** add both `https://build.hio.space` and `https://build.hio.space/**`

---

## Key People

- **Owner:** Poliksena (Poli) Christova — culturenteam@gmail.com (is_admin = true)

---

## Docs Reference

| File | What it answers |
|---|---|
| `docs/ARCHITECTURE.md` | Where does X live? How does data flow? |
| `docs/DESIGN.md` | What do I call this token? What variant should I use? |
| `docs/MODULES.md` | What modules exist? What fields do they have? |
| `docs/AI.md` | What tools can the AI call? What does the system prompt say? |
| `docs/DATABASE.md` | What's in the DB? How do I add a migration? |
