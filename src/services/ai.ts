import { supabase } from './supabase';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-command`;

export interface AIResponse {
  ok: boolean;
  tool?: string;
  section_id?: string | null;
  message: string;
}

export async function sendCommand(prompt: string, pageId: string): Promise<AIResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, message: 'Not authenticated.' };

  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ prompt, page_id: pageId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('ai-command HTTP error', res.status, text);
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }

  return res.json() as Promise<AIResponse>;
}
