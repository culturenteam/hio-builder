import type { TestimonialContent, StyleVariant } from '../../types/module';
import styles from './TestimonialModule.module.css';

interface Props {
  content: TestimonialContent;
  variant: StyleVariant;
}

export function TestimonialModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]} ${content.layout === 'single' ? styles.single : styles.gridLayout}`}>
      {content.title && <h2 className={styles.title}>{content.title}</h2>}
      <div className={styles.items}>
        {content.items.map(item => (
          <blockquote key={item.id} className={styles.card}>
            <p className={styles.quote}>"{item.quote}"</p>
            <footer className={styles.footer}>
              {item.avatar_url && (
                <img src={item.avatar_url} alt={item.author} className={styles.avatar} />
              )}
              <div>
                <cite className={styles.author}>{item.author}</cite>
                {(item.role || item.company) && (
                  <p className={styles.role}>
                    {[item.role, item.company].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
