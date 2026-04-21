-- Ensure admin portal users can read/write event registrations for their org events.
-- This fixes approve/assign-stall flows that update rows but cannot read them back.

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Read registrations linked to events in the caller's organization (or super_admin).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_registrations'
      AND policyname = 'event_registrations_select'
  ) THEN
    CREATE POLICY "event_registrations_select"
      ON public.event_registrations FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = event_registrations.event_id
            AND (
              e.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
              OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
            )
        )
      );
  END IF;
END $$;

-- Insert registrations only for events in caller org (or super_admin).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_registrations'
      AND policyname = 'event_registrations_insert'
  ) THEN
    CREATE POLICY "event_registrations_insert"
      ON public.event_registrations FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = event_registrations.event_id
            AND (
              e.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
              OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
            )
        )
      );
  END IF;
END $$;

-- Update registrations only for events in caller org (or super_admin).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_registrations'
      AND policyname = 'event_registrations_update'
  ) THEN
    CREATE POLICY "event_registrations_update"
      ON public.event_registrations FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = event_registrations.event_id
            AND (
              e.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
              OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = event_registrations.event_id
            AND (
              e.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
              OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
            )
        )
      );
  END IF;
END $$;

-- Delete registrations only for events in caller org (or super_admin).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_registrations'
      AND policyname = 'event_registrations_delete'
  ) THEN
    CREATE POLICY "event_registrations_delete"
      ON public.event_registrations FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = event_registrations.event_id
            AND (
              e.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
              OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
            )
        )
      );
  END IF;
END $$;
