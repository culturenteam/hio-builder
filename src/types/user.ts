export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  llm_model: string;
  is_admin: boolean;
  is_locked: boolean;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
}
