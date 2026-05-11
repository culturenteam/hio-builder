# hio-builder

A modular, AI-powered personal page builder. Live at **https://build.hio.space**.

Compose a page from 9 module types, drag to reorder, pick a visual style per module,
and edit all copy by chatting in plain language. Every user gets a shareable public URL.

---

## What it does

- **Module canvas** — 9 types: Hero, Bio, Services, Calendar, Links, Contact, Gallery, Testimonial, Custom
- **Drag to reorder** — changes persist instantly with optimistic rollback on failure
- **Style variants** — 4 visual treatments per module (minimal, bold, outlined, filled)
- **AI chat sidebar** — natural language commands update copy, links, and calendar events
- **Admin panel** — tier management, per-user module overrides, lock/unlock
- **Public page** — `build.hio.space/[slug]` — no auth required

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3 + TypeScript + Vite |
| Routing | React Router v7 |
| Drag & drop | dnd-kit |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth) |
| AI | Claude Haiku 4.5 (Anthropic) |
| AI transport | Supabase Edge Functions (Deno) |
| Styling | CSS custom properties (no framework) |
| Deploy | Netlify (auto-deploy from GitHub) |

---

## Project structure

```
hio-builder/
├── docs/
│   ├── ARCHITECTURE.md   data flow, folder conventions
│   ├── DESIGN.md         token reference, variants
│   ├── MODULES.md        module registry — source of truth
│   ├── AI.md             Claude tool declarations, system prompt
│   └── DATABASE.md       schema, RLS, migration rules
├── src/
│   ├── styles/           tokens.css + global.css
│   ├── types/            module, page, user, ai types
│   ├── components/
│   │   ├── modules/      9 module renderers + index.tsx
│   │   ├── SectionCard/  builder card with drag handle + toolbar
│   │   └── ChatSidebar/  AI chat UI
│   ├── context/          PageContext, AuthContext
│   ├── services/         supabase.ts, ai.ts
│   ├── hooks/            usePage, useAuth
│   └── pages/            Builder, PublicPage, Admin, Auth
├── supabase/
│   ├── migrations/       001–009 numbered SQL files
│   └── functions/        ai-command Edge Function
└── CLAUDE.md             project rules for AI-assisted development
```

---

## Getting started

```bash
git clone https://github.com/culturenteam/hio-builder.git
cd hio-builder
npm install
```

Set environment variables (or use the values already in `netlify.toml` for local dev):

```
VITE_SUPABASE_URL=https://yfvqmzaqhayveqllchuh.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
```

Add Anthropic key to Supabase Edge Function secrets (never in the client):

```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev   # http://localhost:5173
```

---

## Development phases — all shipped

| Phase | Description |
|---|---|
| 0 — Foundation | Docs, design system, types, scaffold |
| 1 — Infrastructure | Supabase + Auth + PageContext |
| 2 — Builder Canvas | Module renderers, drag-to-reorder, SectionCard toolbar |
| 3 — AI Chat | Claude Haiku, Edge Function, 9 tools |
| 4 — Admin Panel | User list, tier toggle, module overrides, lock |
| 5 — Public Page | `/:slug` read-only view |

---

## Design system

All values in `src/styles/tokens.css`. No raw hex, px, or hardcoded values anywhere else.
See `docs/DESIGN.md`.

## Adding a module

See `docs/MODULES.md` checklist. Registry → types → component → CSS → DB enum — in that order.

## AI integration

Chat sidebar → Supabase Edge Function → Claude Haiku with typed tools.
AI can only call declared operations. See `docs/AI.md`.
