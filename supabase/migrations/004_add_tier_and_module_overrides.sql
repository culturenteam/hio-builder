-- 004: Multi-tenant user tiers and granular module access

CREATE TYPE user_tier AS ENUM ('free', 'paid');

ALTER TABLE public.user_settings
  ADD COLUMN tier             user_tier NOT NULL DEFAULT 'free',
  ADD COLUMN module_overrides JSONB     DEFAULT NULL;

COMMENT ON COLUMN public.user_settings.module_overrides IS
  'NULL = use tier defaults. JSON array of ModuleType strings grants extra access beyond tier, e.g. ["gallery","testimonial"]';

-- RLS helper: returns allowed module types for the calling user
CREATE OR REPLACE FUNCTION allowed_module_types()
RETURNS TEXT[] AS $$
DECLARE
  v_tier          user_tier;
  v_overrides     JSONB;
  v_free_modules  TEXT[] := ARRAY['hero','bio','links','contact'];
  v_all_modules   TEXT[] := ARRAY['hero','bio','services','calendar','links','contact','gallery','testimonial','custom'];
BEGIN
  SELECT tier, module_overrides
    INTO v_tier, v_overrides
    FROM public.user_settings
   WHERE user_id = auth.uid();

  IF v_tier = 'paid' THEN RETURN v_all_modules; END IF;

  IF v_overrides IS NOT NULL THEN
    RETURN (
      SELECT array_agg(DISTINCT t)
      FROM (
        SELECT unnest(v_free_modules) AS t
        UNION
        SELECT jsonb_array_elements_text(v_overrides) AS t
      ) sub
    );
  END IF;

  RETURN v_free_modules;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Sections INSERT policy: enforce module type access
DROP POLICY IF EXISTS "Users can insert own sections" ON public.sections;
CREATE POLICY "Users can insert own sections" ON public.sections
  FOR INSERT WITH CHECK (
    page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid())
    AND type::TEXT = ANY(allowed_module_types())
  );
