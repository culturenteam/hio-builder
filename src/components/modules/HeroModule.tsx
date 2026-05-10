import type { HeroContent, StyleVariant } from '../../types/module';
import styles from './HeroModule.module.css';

interface Props {
  content: HeroContent;
  variant: StyleVariant;
}

export function HeroModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      {content.eyebrow && <p className={styles.eyebrow}>{content.eyebrow}</p>}
      <h1 className={styles.headline}>{content.headline || 'Your headline here'}</h1>
      {content.subheadline && <p className={styles.sub}>{content.subheadline}</p>}
      {content.cta_label && content.cta_url && (
        <a href={content.cta_url} className={styles.cta} target="_blank" rel="noopener">
          {content.cta_label}
        </a>
      )}
    </div>
  );
}
