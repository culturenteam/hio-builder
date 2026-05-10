# DESIGN.md — hio-builder Design System

Every visual decision traces back to a token in `src/styles/tokens.css`.
This file is the reference. The CSS file is the implementation.

---

## Design Language

Technical minimalism. Sharp geometry, generous whitespace, monospace accents.
The builder UI is neutral so user content is the focus.
Public page output expresses any aesthetic via module style variants.

---

## Token Categories

### Colour — Primitives (never use directly in components)

```
--p-black     #0a0a0a
--p-white     #ffffff
--p-gray-50   #f9f9f9
--p-gray-100  #f2f2f2
--p-gray-200  #e5e5e5
--p-gray-300  #d4d4d4
--p-gray-400  #a3a3a3
--p-gray-500  #737373
--p-gray-600  #525252
--p-gray-700  #404040
--p-gray-800  #262626
--p-gray-900  #171717
--p-accent    #2563eb
--p-accent-lt #eff6ff
--p-success   #16a34a
--p-warning   #d97706
--p-error     #dc2626
```

### Colour — Semantic (always use these in components)

**Surfaces**
```
--surface-base      var(--p-white)       page background
--surface-raised    var(--p-gray-50)     cards, panels
--surface-overlay   var(--p-gray-100)    modals, dropdowns
--surface-dark      var(--p-gray-900)    dark sections, sidebars
--surface-accent    var(--p-accent-lt)   highlighted states
```

**Text**
```
--text-primary      var(--p-gray-900)    body copy
--text-secondary    var(--p-gray-600)    captions, labels
--text-tertiary     var(--p-gray-400)    placeholders, disabled
--text-on-dark      var(--p-white)       text on dark surfaces
--text-accent       var(--p-accent)      links, active states
```

**Borders**
```
--border-subtle     var(--p-gray-200)    dividers
--border-strong     var(--p-gray-300)    card edges, inputs
--border-focus      var(--p-accent)      focus rings
--border-dark       var(--p-gray-700)    borders on dark surfaces
```

---

### Spacing (4px base unit)

```
--space-0    0px
--space-1    4px
--space-2    8px
--space-3    12px
--space-4    16px
--space-5    20px
--space-6    24px
--space-8    32px
--space-10   40px
--space-12   48px
--space-16   64px
--space-20   80px
--space-24   96px
--space-32   128px
```

---

### Typography

**Fonts**
```
--font-sans   'Inter', system-ui, sans-serif
--font-mono   'JetBrains Mono', 'Fira Code', monospace
```

**Scale**
```
--text-xs     0.75rem
--text-sm     0.875rem
--text-base   1rem
--text-lg     1.125rem
--text-xl     1.25rem
--text-2xl    1.5rem
--text-3xl    1.875rem
--text-4xl    clamp(1.875rem, 4vw, 2.25rem)
--text-5xl    clamp(2.25rem, 6vw, 3rem)
--text-6xl    clamp(3rem, 8vw, 4.5rem)
```

**Weight**
```
--weight-normal    400
--weight-medium    500
--weight-semibold  600
--weight-bold      700
--weight-black     900
```

---

### Borders & Radius

```
--radius-none   0px
--radius-sm     2px
--radius-md     4px
--radius-lg     8px
--radius-xl     12px
--radius-full   9999px
```

Default to `--radius-sm` or `--radius-none` (technical aesthetic).

---

### Shadows

```
--shadow-sm   0 1px 2px 0 rgba(0,0,0,0.05)
--shadow-md   0 4px 6px -1px rgba(0,0,0,0.08)
--shadow-lg   0 10px 15px -3px rgba(0,0,0,0.10)
--shadow-xl   0 20px 25px -5px rgba(0,0,0,0.12)
```

---

### Transitions

```
--transition-fast   150ms ease
--transition-base   200ms ease
--transition-slow   300ms ease
```

---

### Z-Index

```
--z-base      0
--z-raised    10
--z-dropdown  100
--z-sticky    200
--z-modal     300
--z-toast     400
```

---

## Module Style Variants

Every module supports exactly four variants. Variant changes visual weight and colour
treatment — never the layout structure.

| Variant | Description |
|---|---|
| `minimal` | White bg, thin borders, light text |
| `bold` | `--surface-dark` bg, `--text-on-dark` text, no border |
| `outlined` | White bg, 2px border all around, heavier type weight |
| `filled` | `--surface-raised` bg, accent-coloured eyebrow/label |

Each module CSS file has four classes: `.module--minimal`, `.module--bold`,
`.module--outlined`, `.module--filled`.

---

## Atoms

### Button

Variants: `primary` | `secondary` | `ghost` | `danger`
Sizes: `sm` | `md` | `lg`

```
primary:    --surface-dark bg, --text-on-dark, --radius-sm
secondary:  transparent, --border-strong 1px, --text-primary
ghost:      transparent, no border, --text-secondary (hover: --text-primary)
danger:     --color-error bg, white text
```

Minimum touch target: 40px height.

### Input

```
default:   --surface-base bg, --border-strong 1px, --radius-sm
focused:   --border-focus 1px
error:     --color-error border
disabled:  --surface-overlay bg, --text-tertiary, cursor: not-allowed
```

### Badge

Always `--font-mono`, `--text-xs`, `--tracking-wide`, uppercase.
Variants: `neutral` | `success` | `warning` | `error` | `accent`

---

## Molecules

### ChatMessage
Two layouts: `user` (right-aligned, dark bg) and `agent` (left-aligned, raised bg).

### ModuleCard
Draggable wrapper in the builder canvas.
- Drag handle: left edge, visible on hover
- Type label: top-left, `--font-mono --text-xs`
- Style variant badge: top-right
- Selected state: `--border-focus 2px` ring

### StylePicker
4-swatch grid (40×40px each). Active swatch has `--border-focus 2px` ring.

### WidthSlider
12-step slider (1–12 cols). Current value as `--font-mono` label.

---

## Organisms

### BuilderCanvas
Full-height scrollable area. `--surface-base` bg, `--space-6` gap between modules.
Max content width: `--content-max` (800px), centred.

### ChatSidebar
Fixed right panel, `--sidebar-width` (360px) on desktop, full-width drawer on mobile.
`--surface-raised` bg, `--border-subtle` left border.

### ModuleToolbar
Appears above selected module. Contains style picker, width slider, delete.
`--surface-overlay` bg, `--shadow-md`, `--radius-md`.

---

## Breakpoints

```
--bp-sm   640px
--bp-md   768px
--bp-lg   1024px
--bp-xl   1280px
```

Builder layout:
- `< 768px`: ChatSidebar becomes bottom drawer, canvas full width
- `>= 768px`: ChatSidebar fixed right 360px

Public page:
- Single column `< 640px`
- 12-col grid `>= 640px`, module widths respected
- All modules collapse to full width on mobile regardless of width setting

---

## Grid System

12-column grid for public page output.
Column span: `.col-span-{1-12}` — min module width is 3 columns.
Hero module is always 12 columns (width control disabled).
