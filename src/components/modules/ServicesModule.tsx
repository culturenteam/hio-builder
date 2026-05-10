import React from 'react';
import type { ServicesContent, StyleVariant } from '../../types/module';
import styles from './ServicesModule.module.css';

interface Props {
  content: ServicesContent;
  variant: StyleVariant;
}

export function ServicesModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      <h2 className={styles.title}>{content.title}</h2>
      <div className={styles.grid} style={{ '--cols': content.columns } as React.CSSProperties}>
        {content.items.map((item, i) => (
          <div key={i} className={styles.card}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.description}</p>
            {item.price && <p className={styles.price}>{item.price}</p>}
            {item.cta_label && item.cta_url && (
              <a href={item.cta_url} className={styles.cta} target="_blank" rel="noopener">{item.cta_label}</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
