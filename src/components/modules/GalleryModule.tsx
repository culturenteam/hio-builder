import React from 'react';
import type { GalleryContent, StyleVariant } from '../../types/module';
import styles from './GalleryModule.module.css';

interface Props {
  content: GalleryContent;
  variant: StyleVariant;
}

export function GalleryModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      {content.title && <h2 className={styles.title}>{content.title}</h2>}
      <div className={styles.grid} style={{ '--cols': content.columns } as React.CSSProperties}>
        {content.images.map(img => (
          <figure key={img.id} className={styles.figure}>
            <img src={img.url} alt={img.alt} className={styles.image} />
            {img.caption && <figcaption className={styles.caption}>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
