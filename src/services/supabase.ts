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

export async function insertSection(
  pageId: string,
  type: Section['type'],
  content: Section['content'],
  order: number
): Promise<Section | null> {
  const { data, error } = await supabase
    .from('sections')
    .insert({ page_id: pageId, type, content, style_variant: 'minimal', order, width: 12 })
    .select()
    .single();

  if (error) return null;
  return data as Section;
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

/* ── Admin ───────────────────────────────────────────────── */

export interface AdminUserRow {
  user_id: string;
  email: string;
  slug: string;
  tier: UserSettings['tier'];
  is_admin: boolean;
  is_locked: boolean;
  module_overrides: UserSettings['module_overrides'];
  section_count: number;
  created_at: string;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  // Join user_settings + pages + section count via RPC
  // Fallback: separate queries and merge client-side
  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('user_id, tier, is_admin, is_locked, module_overrides, created_at');

  if (error || !settings) return [];

  const { data: pages } = await supabase
    .from('pages')
    .select('user_id, slug');

  const { data: sections } = await supabase
    .from('sections')
    .select('page_id, pages!inner(user_id)');

  const { data: authUsers } = await supabase.rpc('get_auth_users_for_admin') as any;

  const pageMap = Object.fromEntries((pages ?? []).map(p => [p.user_id, p.slug]));
  const emailMap = Object.fromEntries((authUsers ?? []).map((u: any) => [u.id, u.email]));
  const countMap: Record<string, number> = {};
  (sections ?? []).forEach((s: any) => {
    const uid = s.pages?.user_id;
    if (uid) countMap[uid] = (countMap[uid] ?? 0) + 1;
  });

  return settings.map(s => ({
    user_id: s.user_id,
    email: emailMap[s.user_id] ?? '—',
    slug: pageMap[s.user_id] ?? '—',
    tier: s.tier,
    is_admin: s.is_admin,
    is_locked: s.is_locked,
    module_overrides: s.module_overrides,
    section_count: countMap[s.user_id] ?? 0,
    created_at: s.created_at,
  }));
}

export async function updateUserTier(
  userId: string,
  tier: UserSettings['tier']
): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({ tier })
    .eq('user_id', userId);
  return !error;
}

export async function updateUserModuleOverrides(
  userId: string,
  overrides: string[] | null
): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({ module_overrides: overrides })
    .eq('user_id', userId);
  return !error;
}

export async function updateUserLocked(
  userId: string,
  is_locked: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({ is_locked })
    .eq('user_id', userId);
  return !error;
}
