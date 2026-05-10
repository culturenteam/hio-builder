# AI.md — Claude Integration Spec

## Model

**Claude Haiku 4.5** — `claude-haiku-4-5-20251001`

Budget pick: reliable tool use, fast, ~$0.80/$4 per 1M tokens in/out.
Upgrade path: swap model string to `claude-sonnet-4-6` or `claude-opus-4-7` with zero other changes.

---

## Architecture

```
Client ChatSidebar
  → POST supabase/functions/ai-command  { prompt, page_id }
    → Build context snapshot (sections array)
    → Call Claude Haiku with tool declarations
    → Claude returns tool_use block
    → Edge Function validates + executes mutation
    → Returns { ok, operation, message }
  → PageContext updates sections
  → Chat shows confirmation
```

The Anthropic API key is stored in Supabase Edge Function secrets only — never in the client bundle.

---

## Prompt Caching

System prompt + page context sent as a cache block (5-minute TTL).
Only the new user message is billed at full token rate on repeat turns (~90% cost saving).

```typescript
messages: [{
  role: 'user',
  content: [
    {
      type: 'text',
      text: SYSTEM_PROMPT + pageContextSnapshot,
      cache_control: { type: 'ephemeral' }
    },
    { type: 'text', text: userMessage }
  ]
}]
```

---

## System Prompt

Stored as `SYSTEM_PROMPT` in `src/services/ai.ts`.

```
You are a page editor assistant for hio-builder. You help users manage the content
of their personal page by calling the tools provided.

RULES:
- Make changes ONLY by calling tools. Never describe a change without calling a tool.
- Modify content fields only. You cannot change module types, layout, or design rules.
- Before acting on ambiguous requests, ask one clarifying question.
- After calling a tool, confirm what changed in one or two plain sentences.
- Keep responses short unless the user asks for detail.
- If asked to do something outside your scope (change colours, add module types, change
  layout), explain briefly that those are handled through the visual controls, not chat.
- Dates must be ISO 8601 (YYYY-MM-DD). Resolve "next Friday" to the actual date before calling a tool.
- Never fabricate content.
```

---

## Model Config

```typescript
const AI_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,
  temperature: 0,
}
```

`temperature: 0` — deterministic tool selection.
`max_tokens: 1024` — sufficient for tool calls + short confirmations.

---

## Tool Declarations

### `update_module_content`
Update text fields in any module.
```json
{
  "name": "update_module_content",
  "description": "Updates one or more text fields in a module's content. Use for headlines, body copy, titles, descriptions, labels.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "updates": {
        "type": "object",
        "description": "Partial content object — only the fields to change."
      }
    },
    "required": ["section_id", "updates"]
  }
}
```
Validation: reject updates to `id`, `page_id`, `type`, `order`, `width`, `style_variant`.

---

### `add_event`
```json
{
  "name": "add_event",
  "description": "Adds a new event to a calendar module. Date must be ISO 8601.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "event": {
        "type": "object",
        "properties": {
          "date":        { "type": "string" },
          "time":        { "type": "string" },
          "title":       { "type": "string" },
          "description": { "type": "string" },
          "location":    { "type": "string" },
          "url":         { "type": "string" }
        },
        "required": ["date", "title"]
      }
    },
    "required": ["section_id", "event"]
  }
}
```

---

### `update_event`
```json
{
  "name": "update_event",
  "description": "Updates fields of an existing calendar event.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "event_id":   { "type": "string" },
      "updates":    { "type": "object" }
    },
    "required": ["section_id", "event_id", "updates"]
  }
}
```

---

### `remove_event`
```json
{
  "name": "remove_event",
  "description": "Removes an event from a calendar module.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "event_id":   { "type": "string" }
    },
    "required": ["section_id", "event_id"]
  }
}
```

---

### `add_link`
```json
{
  "name": "add_link",
  "description": "Adds a link card to a links module.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "link": {
        "type": "object",
        "properties": {
          "title":       { "type": "string" },
          "url":         { "type": "string" },
          "description": { "type": "string" },
          "icon":        { "type": "string" }
        },
        "required": ["title", "url"]
      }
    },
    "required": ["section_id", "link"]
  }
}
```

---

### `remove_link`
```json
{
  "name": "remove_link",
  "description": "Removes a link from a links module.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "link_id":    { "type": "string" }
    },
    "required": ["section_id", "link_id"]
  }
}
```

---

### `add_service`
```json
{
  "name": "add_service",
  "description": "Adds a service card to a services module.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "service": {
        "type": "object",
        "properties": {
          "title":       { "type": "string" },
          "description": { "type": "string" },
          "price":       { "type": "string" },
          "cta_label":   { "type": "string" },
          "cta_url":     { "type": "string" }
        },
        "required": ["title", "description"]
      }
    },
    "required": ["section_id", "service"]
  }
}
```

---

### `remove_service`
```json
{
  "name": "remove_service",
  "description": "Removes a service item by index.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id":    { "type": "string" },
      "service_index": { "type": "number" }
    },
    "required": ["section_id", "service_index"]
  }
}
```

---

### `add_testimonial`
```json
{
  "name": "add_testimonial",
  "description": "Adds a testimonial to a testimonial module.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section_id": { "type": "string" },
      "testimonial": {
        "type": "object",
        "properties": {
          "quote":      { "type": "string" },
          "author":     { "type": "string" },
          "role":       { "type": "string" },
          "company":    { "type": "string" },
          "avatar_url": { "type": "string" }
        },
        "required": ["quote", "author"]
      }
    },
    "required": ["section_id", "testimonial"]
  }
}
```

---

## Error Handling

| Error | User-facing message |
|---|---|
| API key missing | "AI chat is not configured yet." |
| Claude returns no tool call | Surface `response.content[0].text` |
| Tool validation fails | "I understood your request but couldn't apply it: [reason]" |
| Supabase write error | "The change couldn't be saved. Please try again." |
| Rate limit | "Too many requests — please wait a moment." |

Never surface raw errors or stack traces to the user.

---

## Adding a New Tool — Checklist

- [ ] Add spec to this file
- [ ] Add tool declaration in `src/services/ai.ts`
- [ ] Add handler in `supabase/functions/ai-command/index.ts`
- [ ] Add server-side input validation
- [ ] Add Supabase mutation in `src/services/supabase.ts`
