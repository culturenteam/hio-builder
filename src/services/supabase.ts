import { createClient } from '@supabase/supabase-js';
import type { Page, Section } from '../types/page';
import type { UserSettings } from '../types/user';
import type { StyleVariant } from '../types/module';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) throw new Error('Missing Supabase env vars');

export const supabase = createClient(url, key);

/* ── Auth ────────────────────────────────────────────────── */

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/* ── Pages ───────────────────────────────────────────────── */

export async function getUserPage(userId: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as Page;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Page;
}

/* ── Sections ────────────────────────────────────────────── */

export async function getSections(pageId: string): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', pageId)
    .order('order', { ascending: true });

  if (error) return [];
  return data as Section[];
}

export async function updateSection(
  id: string,
  updates: Partial<Pick<Section, 'content' | 'style_variant' | 'width' | 'in_navigation' | 'nav_label' | 'nav_order'>>
): Promise<Section | null> {
  const { data, error } = await supabase
    .from('sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data as Section;
}

export async function reorderSections(
  pageId: string,
  orderedIds: string[]
): Promise<boolean> {
  const updates = orderedIds.map((id, index) => ({ id, order: index }));

  const { error } = await supabase.rpc('reorder_sections', {
    p_page_id: pageId,
    p_updates: updates,
  });

  return !error;
}

export async function updateStyleVariant(
  id: string,
  variant: StyleVariant
): Promise<boolean> {
  const { error } = await supabase
    .from('sections')
    .update({ style_variant: variant })
    .eq('id', id);

  return !error;
}

export async function deleteSection(id: string): Promise<boolean> {
  const { error } = await supabase.from('sections').delete().eq('id', id);
  return !error;
}

/* ── User settings ───────────────────────────────────────── */

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as UserSettings;
}
