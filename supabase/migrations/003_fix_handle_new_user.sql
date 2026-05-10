-- 003_fix_handle_new_user.sql
-- Fix: fully qualify all table references with public. schema so the trigger
-- works when called from the auth schema context (where search_path != public).

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  base_slug  := regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9]', '-', 'g');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.pages WHERE slug = final_slug) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.pages (user_id, slug, title) VALUES (NEW.id, final_slug, 'My page');
  INSERT INTO public.sections (page_id, type, content, style_variant, "order", width)
    SELECT p.id, 'hero',
      '{"headline":"Hello, I''m ...","subheadline":"Welcome to my page."}'::jsonb,
      'minimal', 0, 12
    FROM public.pages p WHERE p.user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
