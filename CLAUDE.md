# CLAUDE.md — hio-builder

Read this fully before touching any file. Every rule here overrides default behaviour.

---

## What This Is

**hio-builder** — a modular, AI-powered personal page builder.

Users compose a page from well-defined modules (hero, bio, services, calendar, links, contact).
They drag to reorder, click to change style variants, and use a chat sidebar to edit all copy
and calendar events via natural language.

Stack: **Vite + React 19 + TypeScript + Supabase + Claude Haiku (Anthropic)**

---

## The Non-Negotiables

1. **Never use raw values in components.** Every colour, spacing, radius, shadow, font size
   must reference a CSS custom property from `src/styles/tokens.css`. No hex, no `px` values
   inline, no Tailwind colour utilities that bypass tokens.

2. **Never build a component without checking `docs/DESIGN.md` first.** Every component maps
   to an atom, molecule, or organism defined there. If the component doesn't exist yet, add it
   to DESIGN.md before writing the code.

3. **Never add a module type without updating `docs/MODULES.md`.** The module registry is the
   single source of truth for what exists. Component, type definition, and DB enum must all
   match the registry.

4. **Never write an AI tool without updating `docs/AI.md`.** Tool declarations in the code
   must match the spec in that file exactly.

5. **Never use the `any` type.** All data shapes live in `src/types/`. Extend them, don't bypass them.

6. **Never edit Supabase schema ad-hoc.** All schema changes go through a numbered migration
   file in `supabase/migrations/`. See `docs/DATABASE.md`.

---

## File Structure

```
/
├── docs/
│   ├── ARCHITECTURE.md   ← data flow, folder conventions, component layers
│   ├── DESIGN.md         ← design system: tokens, variants, component patterns
│   ├── MODULES.md        ← module registry (source of truth for all module types)
│   ├── AI.md             ← Claude tool declarations, system prompt spec
│   └── DATABASE.md       ← Supabase schema, RLS, migration conventions
├── src/
│   ├── styles/
│   │   ├── tokens.css    ← ALL CSS custom properties — no raw values anywhere else
│   │   └── global.css    ← resets and base styles, references tokens only
│   ├── types/            ← all TypeScript interfaces and types
│   ├── modules/          ← one folder per module type (renderer + variants)
│   ├── components/       ← shared atoms, molecules, organisms
│   ├── context/          ← React context providers (PageContext, AuthContext)
│   ├── services/         ← API calls (supabase.ts, ai.ts)
│   ├── hooks/            ← custom React hooks
│   └── pages/            ← route-level components (Builder, Public, Auth)
├── supabase/
│   ├── migrations/       ← numbered SQL migration files
│   └── functions/        ← Edge Functions (ai-command)
├── CLAUDE.md             ← this file
└── index.html
```

---

## Current Phase

**Phase 0 — Foundation** ✅ Complete
- [x] Repo created at github.com/culturenteam/hio-builder
- [x] All docs written (docs/)
- [x] Vite + React scaffold
- [x] Design system (tokens.css + global.css)
- [x] TypeScript type system (src/types/)
- [x] Supabase migration 001

**Phase 1 — Infrastructure** (next)
- Supabase project + run migration 001
- Supabase Auth (Google OAuth)
- AuthContext + protected routes
- PageContext (fetch sections from Supabase)

**Phase 2 — Builder Canvas**
- Module renderer (SectionBlock)
- Drag-to-reorder (dnd-kit)
- Width controls

**Phase 3 — AI Chat**
- Claude Haiku integration via Supabase Edge Function
- Tool execution pipeline
- Streaming responses

**Phase 4 — Visual Controls**
- Style variant picker per module
- Live preview

**Phase 5 — Public Page**
- `/:slug` public route

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

## Component Authoring Rules

- One component per file, filename matches the component name exactly.
- Props interfaces defined in the same file, named `[ComponentName]Props`.
- Named exports only — no default exports.
- Styles via CSS Modules (`Component.module.css`) using token vars.
- Comments only when the WHY is non-obvious.

---

## AI Chat Rules

- All AI operations are typed. See `src/types/ai.ts` and `docs/AI.md`.
- The AI may only call declared tools — no free-form mutations.
- Every tool call validated server-side before executing against Supabase.
- System prompt lives in `src/services/ai.ts` as a constant.

---

## Key People

- **Owner:** Poliksena (Poli) Christova
- **Email:** poliksena.s@gmail.com

---

## Docs Reference

| File | What it answers |
|---|---|
| `docs/ARCHITECTURE.md` | Where does X live? How does data flow? |
| `docs/DESIGN.md` | What do I call this token? What variant should I use? |
| `docs/MODULES.md` | What modules exist? What fields do they have? |
| `docs/AI.md` | What tools can the AI call? What does the system prompt say? |
| `docs/DATABASE.md` | What's in the DB? How do I add a migration? |
