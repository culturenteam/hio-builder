import type { ContactContent, StyleVariant } from '../../types/module';
import styles from './ContactModule.module.css';

interface Props {
  content: ContactContent;
  variant: StyleVariant;
}

const platformLabel: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  behance: 'Behance',
  github: 'GitHub',
};

export function ContactModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      <h2 className={styles.title}>{content.title}</h2>
      <div className={styles.info}>
        {content.email && (
          <a href={`mailto:${content.email}`} className={styles.infoItem}>{content.email}</a>
        )}
        {content.phone && (
          <a href={`tel:${content.phone}`} className={styles.infoItem}>{content.phone}</a>
        )}
        {content.location && (
          <span className={styles.infoItem}>{content.location}</span>
        )}
      </div>
      {content.socials && content.socials.length > 0 && (
        <div className={styles.socials}>
          {content.socials.map(s => (
            <a key={s.platform} href={s.url} className={styles.social} target="_blank" rel="noopener">
              {s.label ?? platformLabel[s.platform] ?? s.platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
