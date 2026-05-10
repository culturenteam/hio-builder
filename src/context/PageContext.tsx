import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Page, Section } from '../types/page';
import type { ModuleType, StyleVariant } from '../types/module';
import {
  getUserPage,
  getSections,
  updateSection,
  updateStyleVariant,
  reorderSections,
  deleteSection,
  insertSection,
} from '../services/supabase';

const DEFAULT_CONTENT: Record<ModuleType, Section['content']> = {
  hero:        { headline: 'Your headline here', subheadline: 'A short intro sentence.' } as any,
  bio:         { title: 'About Me', body: 'Write something about yourself here.' } as any,
  services:    { title: 'Services', items: [{ title: 'Service', description: 'Description', price: '', cta_label: '', cta_url: '' }], columns: 2 } as any,
  calendar:    { title: 'Events', events: [], show_past: false } as any,
  links:       { title: 'Links', items: [], columns: 2 } as any,
  contact:     { title: 'Contact', show_form: false } as any,
  gallery:     { title: 'Gallery', images: [], columns: 3 } as any,
  testimonial: { title: 'Testimonials', items: [], layout: 'grid' } as any,
  custom:      { html: '<p>Custom HTML content</p>', height: 200 } as any,
};
import { useAuthContext } from './AuthContext';

interface PageContextValue {
  page: Page | null;
  sections: Section[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateContent: (id: string, content: Section['content']) => Promise<void>;
  updateVariant: (id: string, variant: StyleVariant) => Promise<void>;
  updateWidth: (id: string, width: number) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addSection: (type: ModuleType) => Promise<void>;
}

const PageContext = createContext<PageContextValue | null>(null);

interface PageProviderProps {
  children: ReactNode;
}

export function PageProvider({ children }: PageProviderProps) {
  const { user } = useAuthContext();
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const p = await getUserPage(user.id);
    if (!p) { setError('Could not load page.'); setLoading(false); return; }

    const s = await getSections(p.id);
    setPage(p);
    setSections(s);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  /* Optimistic updaters ──────────────────────────────────── */

  async function updateContent(id: string, content: Section['content']) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
    await updateSection(id, { content });
  }

  async function updateVariant(id: string, variant: StyleVariant) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, style_variant: variant } : s));
    await updateStyleVariant(id, variant);
  }

  async function updateWidth(id: string, width: number) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, width } : s));
    await updateSection(id, { width });
  }

  async function reorder(orderedIds: string[]) {
    const reordered = orderedIds
      .map((id, index) => {
        const section = sections.find(s => s.id === id);
        return section ? { ...section, order: index } : null;
      })
      .filter((s): s is Section => s !== null);

    setSections(reordered);
    if (page) await reorderSections(page.id, orderedIds);
  }

  async function remove(id: string) {
    setSections(prev => prev.filter(s => s.id !== id));
    await deleteSection(id);
  }

  async function addSection(type: ModuleType) {
    if (!page) return;
    const order = sections.length;
    const content = DEFAULT_CONTENT[type];
    const created = await insertSection(page.id, type, content, order);
    if (created) setSections(prev => [...prev, created]);
  }

  return (
    <PageContext.Provider value={{
      page,
      sections,
      loading,
      error,
      refresh: load,
      updateContent,
      updateVariant,
      updateWidth,
      reorder,
      remove,
      addSection,
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
