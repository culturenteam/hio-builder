import type { BioContent, StyleVariant } from '../../types/module';
import styles from './BioModule.module.css';

interface Props {
  content: BioContent;
  variant: StyleVariant;
}

export function BioModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      {content.photo_url && (
        <div className={styles.photoWrap}>
          <img src={content.photo_url} alt={content.photo_alt ?? content.title} className={styles.photo} />
        </div>
      )}
      <div className={styles.text}>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.body}>{content.body}</p>
      </div>
    </div>
  );
}
