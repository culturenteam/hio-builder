import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Page, Section } from '../types/page';
import type { StyleVariant } from '../types/module';
import {
  getUserPage,
  getSections,
  updateSection,
  updateStyleVariant,
  reorderSections,
  deleteSection,
} from '../services/supabase';
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
