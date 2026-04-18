-- Shipment status enum
CREATE TYPE public.shipment_status AS ENUM (
  'pending',
  'label_created',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'returned',
  'lost',
  'cancelled'
);

-- Shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier_name TEXT,
  tracking_number TEXT,
  shipment_status public.shipment_status NOT NULL DEFAULT 'pending',
  shipped_at TIMESTAMPTZ,
  out_for_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  return_received_at TIMESTAMPTZ,
  last_status_note TEXT,
  created_by UUID REFERENCES public.staff_users(id),
  updated_by UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_shipments_tracking ON public.shipments(tracking_number);
CREATE INDEX idx_shipments_status ON public.shipments(shipment_status);

-- Shipment status history (timeline)
CREATE TABLE public.shipment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  old_status public.shipment_status,
  new_status public.shipment_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_history_shipment_id ON public.shipment_status_history(shipment_id);

-- updated_at trigger
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_status_history ENABLE ROW LEVEL SECURITY;

-- RLS: shipments
CREATE POLICY "Staff can view shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operations and admins can insert shipments"
  ON public.shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'operations') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Operations and admins can update shipments"
  ON public.shipments FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'operations') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins can delete shipments"
  ON public.shipments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: shipment_status_history
CREATE POLICY "Staff can view shipment history"
  ON public.shipment_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operations and admins can insert shipment history"
  ON public.shipment_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'operations') OR
    public.has_role(auth.uid(), 'manager')
  );