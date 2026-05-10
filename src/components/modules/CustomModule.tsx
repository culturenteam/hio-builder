import type { CustomContent, StyleVariant } from '../../types/module';
import styles from './CustomModule.module.css';

interface Props {
  content: CustomContent;
  variant: StyleVariant;
}

export function CustomModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      <iframe
        srcDoc={content.html}
        className={styles.frame}
        style={{ height: `${content.height}px` }}
        sandbox="allow-scripts"
        title="Custom content"
      />
    </div>
  );
}
