-- 002_reorder_sections_fn.sql
-- RPC function for bulk section reorder used by PageContext.

CREATE OR REPLACE FUNCTION reorder_sections(
  p_page_id UUID,
  p_updates JSONB
)
RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE sections
    SET "order" = (item->>'order')::INTEGER
    WHERE id = (item->>'id')::UUID
      AND page_id = p_page_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
