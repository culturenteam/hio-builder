import type { ModuleType } from './module';

export type UserTier = 'free' | 'paid';

export const FREE_MODULES: ModuleType[] = ['hero', 'bio', 'links', 'contact'];
export const ALL_MODULES: ModuleType[] = ['hero', 'bio', 'services', 'calendar', 'links', 'contact', 'gallery', 'testimonial', 'custom'];

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  llm_model: string;
  tier: UserTier;
  is_admin: boolean;
  is_locked: boolean;
  is_disabled: boolean;
  module_overrides: ModuleType[] | null;
  created_at: string;
  updated_at: string;
}

export function getAllowedModules(settings: UserSettings): ModuleType[] {
  if (settings.tier === 'paid') return ALL_MODULES;
  if (settings.module_overrides) {
    return Array.from(new Set([...FREE_MODULES, ...settings.module_overrides])) as ModuleType[];
  }
  return FREE_MODULES;
}
