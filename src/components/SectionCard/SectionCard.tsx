import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Section } from '../../types/page';
import type { StyleVariant } from '../../types/module';
import { ModuleRenderer } from '../modules/index';
import { usePage } from '../../hooks/usePage';
import styles from './SectionCard.module.css';

const VARIANTS: StyleVariant[] = ['minimal', 'bold', 'outlined', 'filled'];
const VARIANT_LABELS: Record<StyleVariant, string> = {
  minimal:  'M',
  bold:     'B',
  outlined: 'O',
  filled:   'F',
};
const MIN_WIDTH = 4;
const MAX_WIDTH = 12;

interface Props {
  section: Section;
}

export function SectionCard({ section }: Props) {
  const { updateVariant, updateWidth, remove } = usePage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
    >
      {/* Drag handle */}
      <button
        className={styles.handle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <GripIcon />
      </button>

      {/* Module content */}
      <div className={styles.content}>
        <ModuleRenderer section={section} />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.typeLabel}>{section.type}</span>

        <div className={styles.variantGroup}>
          {VARIANTS.map(v => (
            <button
              key={v}
              className={`${styles.variantBtn} ${section.style_variant === v ? styles.variantActive : ''}`}
              onClick={() => updateVariant(section.id, v)}
              aria-label={`Set variant ${v}`}
              title={v}
            >
              {VARIANT_LABELS[v]}
            </button>
          ))}
        </div>

        <div className={styles.widthGroup}>
          <button
            className={styles.widthBtn}
            onClick={() => updateWidth(section.id, Math.max(MIN_WIDTH, section.width - 1))}
            disabled={section.width <= MIN_WIDTH}
            aria-label="Decrease width"
          >−</button>
          <span className={styles.widthVal}>{section.width}</span>
          <button
            className={styles.widthBtn}
            onClick={() => updateWidth(section.id, Math.min(MAX_WIDTH, section.width + 1))}
            disabled={section.width >= MAX_WIDTH}
            aria-label="Increase width"
          >+</button>
        </div>

        <button
          className={styles.deleteBtn}
          onClick={() => remove(section.id)}
          aria-label="Delete module"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="11" cy="4" r="1.2" fill="currentColor" />
      <circle cx="5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="11" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}
