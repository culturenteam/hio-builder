import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageBySlug, getSections } from '../services/supabase';
import { ModuleRenderer } from '../components/modules/index';
import type { Section } from '../types/page';
import styles from './PublicPage.module.css';

export function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<'loading' | 'not-found' | 'ready'>('loading');

  useEffect(() => {
    if (!slug) { setStatus('not-found'); return; }

    (async () => {
      const p = await getPageBySlug(slug);
      if (!p) { setStatus('not-found'); return; }

      const s = await getSections(p.id);
      setSections(s);
      setStatus('ready');
      document.title = p.title ?? p.slug;
    })();
  }, [slug]);

  if (status === 'loading') {
    return <div className={styles.state}>Loading…</div>;
  }

  if (status === 'not-found') {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundCode}>404</p>
        <p className={styles.notFoundMsg}>This page doesn't exist.</p>
        <Link to="/" className={styles.notFoundLink}>← Go to hio</Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <main className={styles.canvas}>
        {sections.length === 0 ? (
          <div className={styles.empty}>This page has no content yet.</div>
        ) : (
          sections.map(section => (
            <div
              key={section.id}
              className={styles.moduleWrap}
              style={{ '--col-width': section.width } as React.CSSProperties}
            >
              <ModuleRenderer section={section} />
            </div>
          ))
        )}
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.badge}>
          Built with <span className={styles.brandName}>hio</span>
        </Link>
      </footer>
    </div>
  );
}
