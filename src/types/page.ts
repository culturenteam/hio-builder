import type { ModuleType, ModuleContent, StyleVariant } from './module';

export interface Page {
  id: string;
  user_id: string;
  slug: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  type: ModuleType;
  content: ModuleContent;
  style_variant: StyleVariant;
  order: number;
  width: number;
  in_navigation: boolean;
  nav_label: string | null;
  nav_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  order: number;
  section_id: string;
}
