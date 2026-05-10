-- 001_initial_schema.sql
-- Run this in the Supabase SQL editor.
-- See docs/DATABASE.md for full reference.

-- Enums
CREATE TYPE module_type AS ENUM (
  'hero', 'bio', 'services', 'calendar', 'links',
  'contact', 'gallery', 'testimonial', 'custom'
);

CREATE TYPE style_variant AS ENUM (
  'minimal', 'bold', 'outlined', 'filled'
);

-- user_settings
CREATE TABLE user_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (user_id),
  llm_model   TEXT NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  is_locked   BOOLEAN NOT NULL DEFAULT false,
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- pages
CREATE TABLE pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug       TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  title      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pages_user_id_idx ON pages(user_id);
CREATE INDEX pages_slug_idx ON pages(slug);

-- sections
CREATE TABLE sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id       UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type          module_type NOT NULL,
  content       JSONB NOT NULL DEFAULT '{}',
  style_variant style_variant NOT NULL DEFAULT 'minimal',
  "order"       INTEGER NOT NULL DEFAULT 0,
  width         INTEGER NOT NULL DEFAULT 12 CHECK (width BETWEEN 3 AND 12),
  in_navigation BOOLEAN NOT NULL DEFAULT false,
  nav_label     TEXT,
  nav_order     INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT nav_label_required CHECK (
    (in_navigation = false) OR (nav_label IS NOT NULL)
  ),
  CONSTRAINT nav_order_required CHECK (
    (in_navigation = false) OR (nav_order IS NOT NULL)
  ),
  CONSTRAINT hero_full_width CHECK (
    (type != 'hero') OR (width = 12)
  )
);

CREATE INDEX sections_page_id_idx ON sections(page_id);
CREATE INDEX sections_order_idx   ON sections(page_id, "order");

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-provision on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  base_slug  := regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9]', '-', 'g');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM pages WHERE slug = final_slug) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  INSERT INTO pages (user_id, slug, title) VALUES (NEW.id, final_slug, 'My page');
  INSERT INTO sections (page_id, type, content, style_variant, "order", width)
    SELECT p.id, 'hero',
      '{"headline":"Hello, I''m ...","subheadline":"Welcome to my page."}'::jsonb,
      'minimal', 0, 12
    FROM pages p WHERE p.user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_settings
    WHERE user_id = auth.uid() AND is_locked = false AND is_disabled = false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- pages policies
CREATE POLICY "pages_select_public" ON pages FOR SELECT USING (true);
CREATE POLICY "pages_insert_own"    ON pages FOR INSERT WITH CHECK (auth.uid() = user_id AND is_active_user());
CREATE POLICY "pages_update_own"    ON pages FOR UPDATE USING (auth.uid() = user_id AND is_active_user());
CREATE POLICY "pages_delete_own"    ON pages FOR DELETE USING (auth.uid() = user_id);

-- sections policies
CREATE POLICY "sections_select_public" ON sections FOR SELECT USING (true);
CREATE POLICY "sections_insert_own"    ON sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.user_id = auth.uid())
  AND is_active_user()
);
CREATE POLICY "sections_update_own"    ON sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.user_id = auth.uid())
  AND is_active_user()
);
CREATE POLICY "sections_delete_own"    ON sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.user_id = auth.uid())
);

-- user_settings policies
CREATE POLICY "settings_select" ON user_settings FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM user_settings us WHERE us.user_id = auth.uid() AND us.is_admin = true)
);
CREATE POLICY "settings_update_admin" ON user_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_settings us WHERE us.user_id = auth.uid() AND us.is_admin = true)
);
