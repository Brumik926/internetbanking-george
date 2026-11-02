CREATE TABLE public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  email text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.login_events TO authenticated;
GRANT ALL ON public.login_events TO service_role;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own login select" ON public.login_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own login insert" ON public.login_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own login delete" ON public.login_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX login_events_user_time ON public.login_events (user_id, created_at DESC);