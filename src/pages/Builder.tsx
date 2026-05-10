import styles from './Builder.module.css';
import { usePage } from '../hooks/usePage';
import { useAuth } from '../hooks/useAuth';

export function Builder() {
  const { sections, loading, error } = usePage();
  const { user, signOut } = useAuth();

  if (loading) return <div className={styles.state}>Loading your page…</div>;
  if (error)   return <div className={styles.state}>{error}</div>;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>hio</span>
          <button className={styles.signOut} onClick={signOut}>Sign out</button>
        </div>
        <div className={styles.chatPlaceholder}>
          <p>AI chat — Phase 3</p>
        </div>
      </aside>

      <main className={styles.canvas}>
        <div className={styles.canvasInner}>
          {sections.length === 0 && (
            <div className={styles.empty}>
              <p>No modules yet. Add one to get started.</p>
            </div>
          )}
          {sections.map(section => (
            <div key={section.id} className={styles.moduleCard}>
              <span className={styles.moduleLabel}>{section.type}</span>
              <span className={styles.moduleVariant}>{section.style_variant}</span>
            </div>
          ))}
        </div>
        <footer className={styles.footer}>
          <span className={styles.slug}>
            {user?.email} · Phase 2 coming soon
          </span>
        </footer>
      </main>
    </div>
  );
}
