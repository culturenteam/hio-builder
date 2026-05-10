# DATABASE.md — Supabase Schema & Rules

## Migration Conventions

- Files in `supabase/migrations/`, named `NNN_description.sql`
- Never edit a committed migration — add a new one
- Run via Supabase dashboard SQL editor or `supabase db push`

---

## Schema Overview

Three tables + two enums. Full SQL in `supabase/migrations/001_initial_schema.sql`.

### Enums
- `module_type`: `hero | bio | services | calendar | links | contact | gallery | testimonial | custom`
- `style_variant`: `minimal | bold | outlined | filled`

### `user_settings`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| user_id | UUID FK → auth.users | — |
| llm_model | TEXT | 'claude-haiku-4-5-20251001' |
| is_admin | BOOLEAN | false |
| is_locked | BOOLEAN | false |
| is_disabled | BOOLEAN | false |
| created_at / updated_at | TIMESTAMPTZ | now() |

### `pages`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | — |
| user_id | UUID FK → auth.users | CASCADE delete |
| slug | TEXT UNIQUE | pattern `^[a-z0-9-]+$` |
| title | TEXT | nullable |
| created_at / updated_at | TIMESTAMPTZ | — |

### `sections`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | — |
| page_id | UUID FK → pages | CASCADE delete |
| type | module_type | — |
| content | JSONB | validated in Edge Function |
| style_variant | style_variant | default 'minimal' |
| order | INTEGER | sort order |
| width | INTEGER | 3–12, CHECK constraint |
| in_navigation | BOOLEAN | default false |
| nav_label | TEXT | required if in_navigation |
| nav_order | INTEGER | required if in_navigation |
| created_at / updated_at | TIMESTAMPTZ | — |

Constraints:
- `hero` modules always have `width = 12`
- `nav_label` and `nav_order` required when `in_navigation = true`

---

## Auto-Provisioning

On `auth.users` INSERT, the `handle_new_user()` trigger:
1. Creates a `user_settings` row
2. Creates a `pages` row (slug derived from email prefix, guaranteed unique)
3. Seeds a default `hero` section

---

## RLS Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| pages | Public | Own rows, active user | Own rows, active user | Own rows |
| sections | Public | Page owner, active user | Page owner, active user | Page owner |
| user_settings | Own + admins | System (trigger) | Admins only | — |

`is_active_user()` checks `is_locked = false AND is_disabled = false`.

---

## Content Validation

JSONB content shape is NOT enforced at DB level.
Validation happens in `supabase/functions/ai-command/index.ts` before any write.
The content must conform to the interface for the section's `type`. See `docs/MODULES.md`.

---

## Useful Queries

### Full page with sections
```sql
SELECT p.id, p.slug, p.title,
       s.id as section_id, s.type, s.content, s.style_variant,
       s.order, s.width, s.in_navigation, s.nav_label, s.nav_order
FROM pages p
LEFT JOIN sections s ON s.page_id = p.id
WHERE p.slug = 'my-slug'
ORDER BY s.order ASC;
```

### Bulk reorder sections
```sql
UPDATE sections SET "order" = v.new_order
FROM (VALUES ('uuid-1'::uuid, 0), ('uuid-2'::uuid, 1), ('uuid-3'::uuid, 2)) AS v(id, new_order)
WHERE sections.id = v.id AND sections.page_id = 'page-uuid';
```
