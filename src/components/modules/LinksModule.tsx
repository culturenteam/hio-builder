import React from 'react';
import type { LinksContent, StyleVariant } from '../../types/module';
import styles from './LinksModule.module.css';

interface Props {
  content: LinksContent;
  variant: StyleVariant;
}

export function LinksModule({ content, variant }: Props) {
  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      <h2 className={styles.title}>{content.title}</h2>
      <div className={styles.grid} style={{ '--cols': content.columns } as React.CSSProperties}>
        {content.items.map(item => (
          <a key={item.id} href={item.url} className={styles.link} target="_blank" rel="noopener">
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.linkTitle}>{item.title}</span>
            {item.description && <span className={styles.desc}>{item.description}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
