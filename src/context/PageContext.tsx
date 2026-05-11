import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Page, Section } from '../types/page';
import type { ModuleType, StyleVariant } from '../types/module';
import type { UserSettings } from '../types/user';
import { getAllowedModules } from '../types/user';
import {
  getUserPage,
  getSections,
  getUserSettings,
  updateSection,
  updateStyleVariant,
  reorderSections,
  deleteSection,
  insertSection,
} from '../services/supabase';
import { useAuthContext } from './AuthContext';

const DEFAULT_CONTENT: Record<ModuleType, Section['content']> = {
  hero:        { headline: 'Your headline here', subheadline: 'A short intro sentence.' } as Section['content'],
  bio:         { title: 'About Me', body: 'Write something about yourself here.' } as Section['content'],
  services:    { title: 'Services', items: [{ title: 'Service', description: 'Description', price: '', cta_label: '', cta_url: '' }], columns: 2 } as Section['content'],
  calendar:    { title: 'Events', events: [], show_past: false } as Section['content'],
  links:       { title: 'Links', items: [], columns: 2 } as Section['content'],
  contact:     { title: 'Contact', show_form: false } as Section['content'],
  gallery:     { title: 'Gallery', images: [], columns: 3 } as Section['content'],
  testimonial: { title: 'Testimonials', items: [], layout: 'grid' } as Section['content'],
  custom:      { html: '<p>Custom HTML content</p>', height: 200 } as Section['content'],
};

interface PageContextValue {
  page: Page | null;
  sections: Section[];
  settings: UserSettings | null;
  allowedModules: ModuleType[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateContent: (id: string, content: Section['content']) => Promise<boolean>;
  updateVariant: (id: string, variant: StyleVariant) => Promise<boolean>;
  updateWidth: (id: string, width: number) => Promise<boolean>;
  reorder: (orderedIds: string[]) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  addSection: (type: ModuleType) => Promise<void>;
}

const PageContext = createContext<PageContextValue | null>(null);

export function PageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [page, setPage]         = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const [p, s] = await Promise.all([getUserPage(user.id), getUserSettings(user.id)]);
    if (!p) { setError('Could not load page.'); setLoading(false); return; }

    const secs = await getSections(p.id);
    setPage(p);
    setSections(secs);
    setSettings(s);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const allowedModules = settings ? getAllowedModules(settings) : [];

  async function updateContent(id: string, content: Section['content']): Promise<boolean> {
    const prev = sections.find(s => s.id === id);
    setSections(cur => cur.map(s => s.id === id ? { ...s, content } : s));
    const result = await updateSection(id, { content });
    if (!result && prev) setSections(cur => cur.map(s => s.id === id ? prev : s));
    return result !== null;
  }

  async function updateVariant(id: string, variant: StyleVariant): Promise<boolean> {
    const prev = sections.find(s => s.id === id);
    setSections(cur => cur.map(s => s.id === id ? { ...s, style_variant: variant } : s));
    const ok = await updateStyleVariant(id, variant);
    if (!ok && prev) setSections(cur => cur.map(s => s.id === id ? prev : s));
    return ok;
  }

  async function updateWidth(id: string, width: number): Promise<boolean> {
    const prev = sections.find(s => s.id === id);
    setSections(cur => cur.map(s => s.id === id ? { ...s, width } : s));
    const result = await updateSection(id, { width });
    if (!result && prev) setSections(cur => cur.map(s => s.id === id ? prev : s));
    return result !== null;
  }

  async function reorder(orderedIds: string[]): Promise<boolean> {
    const prevSections = sections;
    const reordered = orderedIds
      .map((id, index) => {
        const section = sections.find(s => s.id === id);
        return section ? { ...section, order: index } : null;
      })
      .filter((s): s is Section => s !== null);

    setSections(reordered);
    if (!page) return false;
    const ok = await reorderSections(page.id, orderedIds);
    if (!ok) setSections(prevSections);
    return ok;
  }

  async function remove(id: string): Promise<boolean> {
    const prevSections = sections;
    setSections(prev => prev.filter(s => s.id !== id));
    const ok = await deleteSection(id);
    if (!ok) setSections(prevSections);
    return ok;
  }

  async function addSection(type: ModuleType): Promise<void> {
    if (!page) return;
    const order = sections.length;
    const content = DEFAULT_CONTENT[type];
    const created = await insertSection(page.id, type, content, order);
    if (created) setSections(prev => [...prev, created]);
  }

  return (
    <PageContext.Provider value={{
      page, sections, settings, allowedModules,
      loading, error, refresh: load,
      updateContent, updateVariant, updateWidth,
      reorder, remove, addSection,
    }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error('usePageContext must be used inside PageProvider');
  return ctx;
}
