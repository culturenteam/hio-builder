import Anthropic from 'npm:@anthropic-ai/sdk@0.95.1';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a page editor assistant for hio-builder. You help users manage the content of their personal page by calling the tools provided.

RULES:
- Make changes ONLY by calling tools. Never describe a change without calling a tool.
- Modify content fields only. You cannot change module types, layout, or style variants.
- Before acting on ambiguous requests, ask one clarifying question.
- After calling a tool, confirm what changed in one or two plain sentences.
- Keep responses short unless the user asks for detail.
- If asked to do something outside your scope (change colours, add modules, change layout), explain briefly that those are handled through the visual controls, not chat.
- Dates must be ISO 8601 (YYYY-MM-DD). Resolve relative dates like "next Friday" to the actual date before calling a tool.
- Never fabricate content.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'update_module_content',
    description: 'Updates one or more text fields in a module\'s content. Use for headlines, body copy, titles, descriptions, labels.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        updates: { type: 'object', description: 'Partial content object — only the fields to change.' },
      },
      required: ['section_id', 'updates'],
    },
  },
  {
    name: 'add_event',
    description: 'Adds a new event to a calendar module. Date must be ISO 8601 (YYYY-MM-DD).',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        event: {
          type: 'object',
          properties: {
            date: { type: 'string' }, time: { type: 'string' },
            title: { type: 'string' }, description: { type: 'string' },
            location: { type: 'string' }, url: { type: 'string' },
          },
          required: ['date', 'title'],
        },
      },
      required: ['section_id', 'event'],
    },
  },
  {
    name: 'update_event',
    description: 'Updates fields of an existing calendar event.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        event_id: { type: 'string' },
        updates: { type: 'object' },
      },
      required: ['section_id', 'event_id', 'updates'],
    },
  },
  {
    name: 'remove_event',
    description: 'Removes an event from a calendar module.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        event_id: { type: 'string' },
      },
      required: ['section_id', 'event_id'],
    },
  },
  {
    name: 'add_link',
    description: 'Adds a link card to a links module.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        link: {
          type: 'object',
          properties: {
            title: { type: 'string' }, url: { type: 'string' },
            description: { type: 'string' }, icon: { type: 'string' },
          },
          required: ['title', 'url'],
        },
      },
      required: ['section_id', 'link'],
    },
  },
  {
    name: 'remove_link',
    description: 'Removes a link from a links module by link id.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        link_id: { type: 'string' },
      },
      required: ['section_id', 'link_id'],
    },
  },
  {
    name: 'add_service',
    description: 'Adds a service card to a services module.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        service: {
          type: 'object',
          properties: {
            title: { type: 'string' }, description: { type: 'string' },
            price: { type: 'string' }, cta_label: { type: 'string' }, cta_url: { type: 'string' },
          },
          required: ['title', 'description'],
        },
      },
      required: ['section_id', 'service'],
    },
  },
  {
    name: 'remove_service',
    description: 'Removes a service item by zero-based index.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        service_index: { type: 'number' },
      },
      required: ['section_id', 'service_index'],
    },
  },
  {
    name: 'add_testimonial',
    description: 'Adds a testimonial to a testimonial module.',
    input_schema: {
      type: 'object',
      properties: {
        section_id: { type: 'string' },
        testimonial: {
          type: 'object',
          properties: {
            quote: { type: 'string' }, author: { type: 'string' },
            role: { type: 'string' }, company: { type: 'string' }, avatar_url: { type: 'string' },
          },
          required: ['quote', 'author'],
        },
      },
      required: ['section_id', 'testimonial'],
    },
  },
];

/* ── Helpers ──────────────────────────────────────────────── */

function crypto_uuid() {
  return crypto.randomUUID();
}

const PROTECTED_FIELDS = new Set(['id', 'page_id', 'type', 'order', 'width', 'style_variant']);

function buildPageContext(sections: any[]): string {
  if (!sections.length) return 'The page has no modules yet.';
  return 'Current page modules:\n' + sections.map(s =>
    `- id: ${s.id} | type: ${s.type} | variant: ${s.style_variant}\n  content: ${JSON.stringify(s.content)}`
  ).join('\n');
}

/* ── Tool execution ───────────────────────────────────────── */

async function executeTool(
  toolName: string,
  input: any,
  sections: any[],
  supabase: any,
): Promise<{ ok: boolean; message: string }> {
  const section = sections.find((s: any) => s.id === input.section_id);

  switch (toolName) {
    case 'update_module_content': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const forbidden = Object.keys(input.updates).filter(k => PROTECTED_FIELDS.has(k));
      if (forbidden.length) return { ok: false, message: `Cannot update protected fields: ${forbidden.join(', ')}` };
      const newContent = { ...section.content, ...input.updates };
      const { error } = await supabase.from('sections').update({ content: newContent }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to save changes.' };
      return { ok: true, message: `Updated ${section.type} module content.` };
    }

    case 'add_event': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const events = [...(section.content.events ?? []), { ...input.event, id: crypto_uuid() }];
      const { error } = await supabase.from('sections').update({ content: { ...section.content, events } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to save event.' };
      return { ok: true, message: `Added event "${input.event.title}".` };
    }

    case 'update_event': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const events = (section.content.events ?? []).map((e: any) =>
        e.id === input.event_id ? { ...e, ...input.updates } : e
      );
      const { error } = await supabase.from('sections').update({ content: { ...section.content, events } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to update event.' };
      return { ok: true, message: 'Event updated.' };
    }

    case 'remove_event': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const events = (section.content.events ?? []).filter((e: any) => e.id !== input.event_id);
      const { error } = await supabase.from('sections').update({ content: { ...section.content, events } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to remove event.' };
      return { ok: true, message: 'Event removed.' };
    }

    case 'add_link': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const items = [...(section.content.items ?? []), { ...input.link, id: crypto_uuid() }];
      const { error } = await supabase.from('sections').update({ content: { ...section.content, items } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to save link.' };
      return { ok: true, message: `Added link "${input.link.title}".` };
    }

    case 'remove_link': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const items = (section.content.items ?? []).filter((l: any) => l.id !== input.link_id);
      const { error } = await supabase.from('sections').update({ content: { ...section.content, items } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to remove link.' };
      return { ok: true, message: 'Link removed.' };
    }

    case 'add_service': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const items = [...(section.content.items ?? []), input.service];
      const { error } = await supabase.from('sections').update({ content: { ...section.content, items } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to save service.' };
      return { ok: true, message: `Added service "${input.service.title}".` };
    }

    case 'remove_service': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const items = [...(section.content.items ?? [])];
      items.splice(input.service_index, 1);
      const { error } = await supabase.from('sections').update({ content: { ...section.content, items } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to remove service.' };
      return { ok: true, message: 'Service removed.' };
    }

    case 'add_testimonial': {
      if (!section) return { ok: false, message: 'Section not found.' };
      const items = [...(section.content.items ?? []), { ...input.testimonial, id: crypto_uuid() }];
      const { error } = await supabase.from('sections').update({ content: { ...section.content, items } }).eq('id', input.section_id);
      if (error) return { ok: false, message: 'Failed to save testimonial.' };
      return { ok: true, message: `Added testimonial from "${input.testimonial.author}".` };
    }

    default:
      return { ok: false, message: `Unknown tool: ${toolName}` };
  }
}

/* ── Handler ──────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ ok: false, message: 'AI chat is not configured yet.' }, 503);

    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!jwt) return json({ ok: false, message: 'Unauthorized.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify JWT and get user
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ ok: false, message: 'Unauthorized.' }, 401);

    const { prompt, page_id } = await req.json() as { prompt: string; page_id: string };
    if (!prompt || !page_id) return json({ ok: false, message: 'Missing prompt or page_id.' }, 400);

    // Verify user owns this page
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: page } = await adminClient.from('pages').select('id').eq('id', page_id).eq('user_id', user.id).single();
    if (!page) return json({ ok: false, message: 'Page not found.' }, 404);

    // Load current sections
    const { data: sections } = await adminClient.from('sections').select('*').eq('page_id', page_id).order('order');

    // Call Claude Haiku
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_PROMPT + '\n\n' + buildPageContext(sections ?? []), cache_control: { type: 'ephemeral' } },
      ] as any,
      tools: TOOLS,
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content: prompt }],
    });

    // Find tool call in response
    const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
    const textBlock = response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;

    if (!toolUse) {
      // Claude replied with text only (clarifying question or out-of-scope)
      return json({ ok: true, message: textBlock?.text ?? 'I didn\'t understand that request.' });
    }

    const result = await executeTool(toolUse.name, toolUse.input, sections ?? [], adminClient);

    return json({
      ok: result.ok,
      tool: toolUse.name,
      section_id: (toolUse.input as any).section_id ?? null,
      message: result.ok ? (textBlock?.text ?? result.message) : result.message,
    });

  } catch (err) {
    console.error('ai-command error:', err);
    return json({ ok: false, message: 'Something went wrong. Please try again.' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
