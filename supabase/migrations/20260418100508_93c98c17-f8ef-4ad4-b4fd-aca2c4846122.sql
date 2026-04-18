-- Enums
CREATE TYPE public.ticket_issue_type AS ENUM (
  'late_delivery',
  'wrong_item',
  'missing_item',
  'damaged_item',
  'quality_issue',
  'refund_request',
  'exchange_request',
  'courier_issue',
  'general_complaint',
  'inquiry'
);

CREATE TYPE public.ticket_status AS ENUM (
  'new',
  'open',
  'waiting_customer',
  'waiting_internal',
  'escalated',
  'resolved',
  'closed',
  'reopened'
);

CREATE TYPE public.ticket_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE public.ticket_event_type AS ENUM (
  'created',
  'status_changed',
  'priority_changed',
  'assigned',
  'unassigned',
  'comment',
  'internal_note',
  'attachment',
  'resolved',
  'reopened',
  'closed'
);

-- Sequence for ticket numbers
CREATE SEQUENCE public.ticket_number_seq START 1;

-- support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  issue_type public.ticket_issue_type NOT NULL DEFAULT 'inquiry',
  ticket_status public.ticket_status NOT NULL DEFAULT 'new',
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES public.staff_users(id),
  opened_by UUID REFERENCES public.staff_users(id),
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_customer ON public.support_tickets(customer_id);
CREATE INDEX idx_tickets_order ON public.support_tickets(order_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(ticket_status);
CREATE INDEX idx_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_tickets_issue_type ON public.support_tickets(issue_type);

-- ticket_events table (action log)
CREATE TABLE public.ticket_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  event_type public.ticket_event_type NOT NULL,
  actor_id UUID REFERENCES public.staff_users(id),
  message TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_events_ticket ON public.ticket_events(ticket_id);
CREATE INDEX idx_ticket_events_created ON public.ticket_events(created_at DESC);

-- Auto-generate ticket_number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'TKT-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('ticket_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view ticket events"
  ON public.ticket_events FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert ticket events"
  ON public.ticket_events FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can delete ticket events"
  ON public.ticket_events FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));