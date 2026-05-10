import type { CalendarContent, StyleVariant } from '../../types/module';
import styles from './CalendarModule.module.css';

interface Props {
  content: CalendarContent;
  variant: StyleVariant;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CalendarModule({ content, variant }: Props) {
  const now = new Date();
  const events = content.events
    .filter(e => content.show_past || new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={`${styles.module} ${styles[variant]}`}>
      <h2 className={styles.title}>{content.title}</h2>
      {events.length === 0 ? (
        <p className={styles.empty}>No upcoming events.</p>
      ) : (
        <ul className={styles.list}>
          {events.map(event => (
            <li key={event.id} className={styles.event}>
              <div className={styles.dateBadge}>
                <span className={styles.dateText}>{formatDate(event.date)}</span>
                {event.time && <span className={styles.time}>{event.time}</span>}
              </div>
              <div className={styles.eventBody}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                {event.description && <p className={styles.eventDesc}>{event.description}</p>}
                {event.location && <p className={styles.location}>📍 {event.location}</p>}
                {event.url && (
                  <a href={event.url} className={styles.eventLink} target="_blank" rel="noopener">
                    Register →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
