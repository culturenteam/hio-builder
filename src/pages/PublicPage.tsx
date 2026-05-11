import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageBySlug, getSections } from '../services/supabase';
import { ModuleRenderer } from '../components/modules/index';
import type { Section } from '../types/page';
import styles from './PublicPage.module.css';

type Status = 'loading' | 'not-found' | 'error' | 'ready';

export function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!slug) { setStatus('not-found'); return; }

    (async () => {
      const result = await getPageBySlug(slug);

      if ('notFound' in result) { setStatus('not-found'); return; }
      if ('error' in result)    { setStatus('error'); return; }

      const s = await getSections(result.page.id);
      setSections(s);
      setStatus('ready');
      document.title = result.page.title ?? result.page.slug;
    })();
  }, [slug]);

  if (status === 'loading') {
    return <div className={styles.state}>Loading…</div>;
  }

  if (status === 'error') {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundCode}>500</p>
        <p className={styles.notFoundMsg}>Something went wrong. Try again in a moment.</p>
        <Link to="/" className={styles.notFoundLink}>← Go to hio</Link>
      </div>
    );
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
      {sections.length === 0 ? (
        <div className={styles.empty}>This page has no content yet.</div>
      ) : (
        <main className={styles.main}>
          {sections.map((section, i) => (
            <section
              key={section.id}
              className={styles.section}
              data-variant={section.style_variant}
              data-first={i === 0 ? 'true' : undefined}
            >
              <div
                className={styles.inner}
                style={{ '--col-width': section.width } as React.CSSProperties}
              >
                <ModuleRenderer section={section} />
              </div>
            </section>
          ))}
        </main>
      )}

      <footer className={styles.footer}>
        <Link to="/" className={styles.badge}>
          Built with <span className={styles.brandName}>hio</span>
        </Link>
      </footer>
    </div>
  );
}
