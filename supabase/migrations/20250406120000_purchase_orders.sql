-- Purchase orders for vendors on events (Option A: created from event edit flow)

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  po_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'cancelled')),
  currency text NOT NULL DEFAULT 'INR',
  notes text,
  subtotal numeric(14, 2) NOT NULL DEFAULT 0,
  tax_total numeric(14, 2) NOT NULL DEFAULT 0,
  grand_total numeric(14, 2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, po_number)
);

CREATE TABLE IF NOT EXISTS public.purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  line_no int NOT NULL,
  description text NOT NULL DEFAULT '',
  quantity numeric(14, 4) NOT NULL DEFAULT 1,
  unit_price numeric(14, 2) NOT NULL DEFAULT 0,
  amount numeric(14, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_event_id ON public.purchase_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_organization_id ON public.purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_lines_po_id ON public.purchase_order_lines(purchase_order_id);

COMMENT ON TABLE public.purchase_orders IS 'Vendor purchase orders scoped to an event and organization.';
COMMENT ON TABLE public.purchase_order_lines IS 'Line items for a purchase order.';

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;

-- Helper: current user is super_admin
-- Policies: org members see their org''s POs; super_admin sees all

CREATE POLICY "purchase_orders_select"
  ON public.purchase_orders FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

CREATE POLICY "purchase_orders_insert"
  ON public.purchase_orders FOR INSERT TO authenticated
  WITH CHECK (
    (
      organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_id AND e.organization_id = purchase_orders.organization_id
      )
      AND EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_id AND v.organization_id = purchase_orders.organization_id
      )
    )
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

CREATE POLICY "purchase_orders_update"
  ON public.purchase_orders FOR UPDATE TO authenticated
  USING (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  )
  WITH CHECK (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

CREATE POLICY "purchase_orders_delete"
  ON public.purchase_orders FOR DELETE TO authenticated
  USING (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

CREATE POLICY "purchase_order_lines_select"
  ON public.purchase_order_lines FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_id
        AND (
          po.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
          OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
        )
    )
  );

CREATE POLICY "purchase_order_lines_insert"
  ON public.purchase_order_lines FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_id
        AND (
          po.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
          OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
        )
    )
  );

CREATE POLICY "purchase_order_lines_update"
  ON public.purchase_order_lines FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_id
        AND (
          po.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
          OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
        )
    )
  );

CREATE POLICY "purchase_order_lines_delete"
  ON public.purchase_order_lines FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_id
        AND (
          po.organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
          OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
        )
    )
  );
