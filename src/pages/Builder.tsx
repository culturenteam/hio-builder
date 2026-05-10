import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SectionCard } from '../components/SectionCard/SectionCard';
import { usePage } from '../hooks/usePage';
import { useAuth } from '../hooks/useAuth';
import type { ModuleType } from '../types/module';
import styles from './Builder.module.css';

const MODULE_TYPES: ModuleType[] = [
  'hero', 'bio', 'services', 'calendar',
  'links', 'contact', 'gallery', 'testimonial', 'custom',
];

const MODULE_ICONS: Record<ModuleType, string> = {
  hero:        '✦',
  bio:         '◉',
  services:    '◈',
  calendar:    '◻',
  links:       '⟡',
  contact:     '◎',
  gallery:     '▦',
  testimonial: '❝',
  custom:      '⌥',
};

export function Builder() {
  const { sections, loading, error, reorder, addSection, allowedModules } = usePage();
  const { user, signOut } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState<ModuleType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    await reorder(reordered.map(s => s.id));
  }

  async function handleAdd(type: ModuleType) {
    setAdding(type);
    await addSection(type);
    setAdding(null);
    setAddOpen(false);
  }

  if (loading) return <div className={styles.state}>Loading your page…</div>;
  if (error)   return <div className={styles.state}>{error}</div>;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>hio</span>
          <button className={styles.signOut} onClick={signOut}>Sign out</button>
        </div>
        <div className={styles.chatPlaceholder}>
          <p>AI chat — Phase 3</p>
        </div>
      </aside>

      {/* Canvas */}
      <main className={styles.canvas}>
        <div className={styles.canvasInner}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map(section => (
                <SectionCard key={section.id} section={section} />
              ))}
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <div className={styles.empty}>
              <p>No modules yet — add your first one below.</p>
            </div>
          )}

          {/* Add module button */}
          <button
            className={styles.addBtn}
            onClick={() => setAddOpen(o => !o)}
            aria-expanded={addOpen}
          >
            <span className={styles.addIcon}>{addOpen ? '×' : '+'}</span>
            Add module
          </button>

          {/* Module type picker */}
          {addOpen && (
            <div className={styles.picker}>
              {MODULE_TYPES.map(type => {
                const locked = allowedModules.length > 0 && !allowedModules.includes(type);
                return (
                  <button
                    key={type}
                    className={`${styles.pickerItem} ${locked ? styles.pickerLocked : ''}`}
                    onClick={() => !locked && handleAdd(type)}
                    disabled={adding === type || locked}
                    title={locked ? 'Upgrade to paid to unlock' : type}
                  >
                    <span className={styles.pickerIcon}>{locked ? '🔒' : MODULE_ICONS[type]}</span>
                    <span className={styles.pickerLabel}>{type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.slug}>
            hio.page/{user?.email?.split('@')[0]} · {sections.length} module{sections.length !== 1 ? 's' : ''}
          </span>
        </footer>
      </main>
    </div>
  );
}
