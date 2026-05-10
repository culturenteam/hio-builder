# MODULES.md — Module Registry

Single source of truth for all module types.

Before adding a new module:
1. Add row to the registry table
2. Write the full spec section below
3. Add type to `ModuleType` in `src/types/module.ts`
4. Add content interface to `src/types/module.ts`
5. Create `src/modules/[type]/` folder
6. Add DB enum value in a new Supabase migration

---

## Registry

| Type | Display name | Status | Variants | Notes |
|---|---|---|---|---|
| `hero` | Hero | planned | all 4 | Full-width, always 12 cols |
| `bio` | Bio / About | planned | all 4 | Text + optional photo |
| `services` | Services | planned | all 4 | Grid of service cards |
| `calendar` | Calendar / Events | planned | all 4 | Dated event list |
| `links` | Links Grid | planned | all 4 | Curated link cards |
| `contact` | Contact | planned | all 4 | Email, phone, socials |
| `gallery` | Gallery | planned | minimal, outlined | Image grid |
| `testimonial` | Testimonial | planned | all 4 | Quote + attribution |
| `custom` | Custom HTML | planned | none | Sandboxed iframe |

---

## Module Specs

### `hero`
```typescript
interface HeroContent {
  headline: string       // max 80 chars
  subheadline?: string   // max 160 chars
  cta_label?: string     // max 30 chars
  cta_url?: string
  eyebrow?: string       // max 40 chars
}
```
Default: `{ headline: "Hello, I'm ...", subheadline: "Welcome to my page." }`
Width: always 12 (locked).

---

### `bio`
```typescript
interface BioContent {
  title: string          // max 60 chars
  body: string           // markdown, max 800 chars
  photo_url?: string
  photo_alt?: string     // required if photo_url set
}
```
Width: 4–12.

---

### `services`
```typescript
interface ServiceItem {
  title: string          // max 40 chars
  description: string    // max 200 chars
  price?: string
  cta_label?: string
  cta_url?: string
}
interface ServicesContent {
  title: string
  items: ServiceItem[]   // min 1, max 9
  columns: 2 | 3
}
```
Width: 6–12.

---

### `calendar`
```typescript
interface CalendarEvent {
  id: string
  date: string           // ISO 8601 YYYY-MM-DD
  time?: string          // HH:MM 24h
  title: string          // max 80 chars
  description?: string   // max 300 chars
  location?: string      // max 100 chars
  url?: string
}
interface CalendarContent {
  title: string
  events: CalendarEvent[]
  show_past: boolean
}
```
**AI note:** Primary target for natural language commands. Tools: `add_event`, `update_event`, `remove_event`.
Dates must validate as ISO 8601 before storing.
Width: 4–12.

---

### `links`
```typescript
interface LinkItem {
  id: string
  title: string          // max 60 chars
  url: string
  description?: string   // max 120 chars
  icon?: string          // emoji or icon name
}
interface LinksContent {
  title: string
  items: LinkItem[]      // min 1, max 12
  columns: 2 | 3 | 4
}
```
Width: 4–12.

---

### `contact`
```typescript
interface SocialHandle {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'behance' | 'github'
  url: string
  label?: string
}
interface ContactContent {
  title: string
  email?: string
  phone?: string
  location?: string
  socials?: SocialHandle[]
  show_form: boolean
}
```
Width: 4–12.

---

### `gallery`
```typescript
interface GalleryImage {
  id: string
  url: string
  alt: string
  caption?: string
}
interface GalleryContent {
  title?: string
  images: GalleryImage[] // min 1, max 20
  columns: 2 | 3 | 4
}
```
Variants: `minimal` and `outlined` only.
Width: 6–12.

---

### `testimonial`
```typescript
interface TestimonialItem {
  id: string
  quote: string          // max 300 chars
  author: string         // max 60 chars
  role?: string
  company?: string
  avatar_url?: string
}
interface TestimonialContent {
  title?: string
  items: TestimonialItem[] // min 1, max 6
  layout: 'single' | 'grid'
}
```
Width: 4–12.

---

### `custom`
```typescript
interface CustomContent {
  html: string           // max 10000 chars
  height: number         // iframe height px, default 400
}
```
Variants: none. AI may NOT modify custom modules.
Rendered in sandboxed iframe: `sandbox="allow-scripts"`.
Width: 3–12.

---

## Adding a New Module — Checklist

- [ ] Add row to registry table
- [ ] Write spec section in this file
- [ ] Add `ModuleType` value in `src/types/module.ts`
- [ ] Add content interface in `src/types/module.ts`
- [ ] Create `src/modules/[type]/[Type]Module.tsx`
- [ ] Create `src/modules/[type]/[type].defaults.ts`
- [ ] Create `src/modules/[type]/[Type]Module.module.css` with 4 variant classes
- [ ] Add DB enum value: new migration `supabase/migrations/NNN_add_[type]_module.sql`
- [ ] Add AI tools if needed (structured sub-items like events/links)
- [ ] Add tool spec to `docs/AI.md`
