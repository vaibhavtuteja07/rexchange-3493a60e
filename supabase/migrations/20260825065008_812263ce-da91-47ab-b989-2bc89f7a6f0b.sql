-- 1. LISTINGS: hide contact from public reads
DROP POLICY IF EXISTS "listings public read" ON public.listings;
DROP POLICY IF EXISTS "listings public insert" ON public.listings;

CREATE POLICY "listings public read" ON public.listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "listings public insert" ON public.listings FOR INSERT TO anon, authenticated WITH CHECK (true);

REVOKE SELECT ON public.listings FROM anon, authenticated;
GRANT SELECT (id, title, category, type, description, poster_name, poster_year, exchange_count, trust_tier, created_at)
  ON public.listings TO anon, authenticated;
GRANT INSERT ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;

-- 2. EVENTS: no open updates; controlled interest counter only
DROP POLICY IF EXISTS "events public update" ON public.events;
DROP POLICY IF EXISTS "events public insert" ON public.events;
REVOKE UPDATE, INSERT ON public.events FROM anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;

CREATE OR REPLACE FUNCTION public.adjust_event_interest(_event_id uuid, _delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF _delta NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'invalid delta';
  END IF;

  UPDATE public.events
     SET interested_count = GREATEST(0, interested_count + _delta)
   WHERE id = _event_id
  RETURNING interested_count INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'event not found';
  END IF;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_event_interest(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_event_interest(uuid, integer) TO anon, authenticated, service_role;

-- 3. NEED BOARD: reads stay public, writes go through the server only
DROP POLICY IF EXISTS "need_posts public insert" ON public.need_posts;
DROP POLICY IF EXISTS "need_replies public insert" ON public.need_replies;
REVOKE INSERT, UPDATE, DELETE ON public.need_posts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.need_replies FROM anon, authenticated;
GRANT SELECT ON public.need_posts TO anon, authenticated;
GRANT SELECT ON public.need_replies TO anon, authenticated;
GRANT ALL ON public.need_posts TO service_role;
GRANT ALL ON public.need_replies TO service_role;

-- 4. WATCH KEYWORDS: private, server-mediated only
DROP POLICY IF EXISTS "watch public read" ON public.watch_keywords;
DROP POLICY IF EXISTS "watch public insert" ON public.watch_keywords;
DROP POLICY IF EXISTS "watch public delete" ON public.watch_keywords;
REVOKE ALL ON public.watch_keywords FROM anon, authenticated;
GRANT ALL ON public.watch_keywords TO service_role;
