# hio-builder

A modular, AI-powered personal page builder. Compose a page from well-defined modules, drag to reorder them, pick a visual style per module, and edit all copy and calendar events by chatting in plain language.

---

## What it does

- **Module canvas** — build a page from 9 module types: Hero, Bio, Services, Calendar, Links, Contact, Gallery, Testimonial, Custom
- **Drag to reorder** — rearrange modules freely, changes persist instantly
- **Style variants** — every module has 4 visual treatments (minimal, bold, outlined, filled) switchable with one click
- **AI chat sidebar** — type natural language commands to update copy, add calendar events, manage links and services
- **Public page** — every user gets a shareable `/:slug` URL, no auth required to view

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Routing | React Router v6 |
| Drag & drop | dnd-kit |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| AI | Claude Haiku 4.5 (Anthropic) |
| AI transport | Supabase Edge Functions (Deno) |
| Styling | CSS custom properties (no framework) |

---

## Project structure

```
hio-builder/
├── docs/
│   ├── ARCHITECTURE.md   data flow, folder conventions, component layers
│   ├── DESIGN.md         token reference, variants, component patterns
│   ├── MODULES.md        module registry — source of truth for all types
│   ├── AI.md             Claude tool declarations, system prompt spec
│   └── DATABASE.md       Supabase schema, RLS policies, migration rules
├── src/
│   ├── styles/
│   │   ├── tokens.css    all CSS custom properties
│   │   └── global.css    base resets
│   ├── types/            TypeScript interfaces (module, page, user, ai, api)
│   ├── modules/          one folder per module type
│   ├── components/       atoms → molecules → organisms
│   ├── context/          PageContext, AuthContext
│   ├── services/         supabase.ts, ai.ts
│   ├── hooks/            usePage, useAuth, useDrag, useStylePicker
│   └── pages/            Builder, Public, Auth
├── supabase/
│   ├── migrations/       numbered SQL files
│   └── functions/        ai-command Edge Function
└── CLAUDE.md             project rules for AI-assisted development
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/culturenteam/hio-builder.git
cd hio-builder
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run `supabase/migrations/001_initial_schema.sql`
3. Enable Google OAuth under Authentication → Providers

### 3. Add environment variables

```bash
cp .env.example .env.local
```

Fill in your values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Add the Anthropic API key (Edge Function only)

In the Supabase dashboard → Edge Functions → Secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
```

This key never touches the client bundle.

### 5. Run locally

```bash
npm run dev
```

---

## Development phases

| Phase | Status | Description |
|---|---|---|
| 0 — Foundation | ✅ Done | Docs, design system, types, scaffold |
| 1 — Infrastructure | 🔜 Next | Supabase + Auth + PageContext |
| 2 — Builder Canvas | Planned | Module renderer, drag-to-reorder, width controls |
| 3 — AI Chat | Planned | Claude integration, tool execution, streaming |
| 4 — Visual Controls | Planned | Style variant picker, live preview |
| 5 — Public Page | Planned | `/:slug` server-rendered public view |

---

## Design system

All visual values live in `src/styles/tokens.css` as CSS custom properties.
No raw hex, px, or hardcoded values anywhere else in the codebase.
See `docs/DESIGN.md` for the full token reference.

---

## Adding a module

See the checklist at the bottom of `docs/MODULES.md`. Every new module requires
updating the registry, the TypeScript types, the component, the CSS variants,
and the database enum — in that order.

---

## AI integration

The chat sidebar sends commands to a Supabase Edge Function which calls Claude Haiku
with typed tool declarations. The AI can only perform declared operations — no free-form
mutations. See `docs/AI.md` for the full tool spec and system prompt.

---

## Contributing / working with AI tools

Read `CLAUDE.md` before making any changes. It contains the non-negotiable rules
for tokens, components, module registration, and database migrations that keep
the codebase consistent across sessions.
