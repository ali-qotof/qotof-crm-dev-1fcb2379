-- Enums
CREATE TYPE public.interaction_channel AS ENUM (
  'phone_call',
  'whatsapp',
  'sms',
  'email',
  'in_person',
  'messenger',
  'system_note'
);

CREATE TYPE public.interaction_direction AS ENUM ('inbound', 'outbound', 'internal');

CREATE TYPE public.crm_action_type AS ENUM (
  'first_order_followup',
  'post_delivery_check',
  'cross_sell',
  'upsell',
  'winback',
  'reactivation',
  'review_request',
  'complaint_recovery'
);

CREATE TYPE public.crm_action_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'skipped',
  'snoozed'
);

CREATE TYPE public.task_type AS ENUM (
  'call_customer',
  'confirm_order',
  'confirm_address',
  'followup_shipment',
  'resolve_complaint',
  'reactivation_call',
  'general_task'
);

CREATE TYPE public.task_status AS ENUM (
  'todo',
  'in_progress',
  'blocked',
  'done',
  'cancelled'
);

CREATE TYPE public.priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- interactions
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  channel public.interaction_channel NOT NULL,
  direction public.interaction_direction NOT NULL DEFAULT 'outbound',
  summary TEXT NOT NULL,
  outcome TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_customer ON public.interactions(customer_id);
CREATE INDEX idx_interactions_order ON public.interactions(order_id);
CREATE INDEX idx_interactions_ticket ON public.interactions(ticket_id);
CREATE INDEX idx_interactions_occurred ON public.interactions(occurred_at DESC);

-- crm_actions
CREATE TABLE public.crm_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  action_type public.crm_action_type NOT NULL,
  action_status public.crm_action_status NOT NULL DEFAULT 'pending',
  priority public.priority_level NOT NULL DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.staff_users(id),
  created_by UUID REFERENCES public.staff_users(id),
  notes TEXT,
  completion_note TEXT,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_actions_customer ON public.crm_actions(customer_id);
CREATE INDEX idx_crm_actions_assigned ON public.crm_actions(assigned_to);
CREATE INDEX idx_crm_actions_status ON public.crm_actions(action_status);
CREATE INDEX idx_crm_actions_type ON public.crm_actions(action_type);
CREATE INDEX idx_crm_actions_due ON public.crm_actions(due_at);

-- tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type public.task_type NOT NULL DEFAULT 'general_task',
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.priority_level NOT NULL DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.staff_users(id),
  created_by UUID REFERENCES public.staff_users(id),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due ON public.tasks(due_at);
CREATE INDEX idx_tasks_customer ON public.tasks(customer_id);

-- updated_at triggers
CREATE TRIGGER update_crm_actions_updated_at
  BEFORE UPDATE ON public.crm_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- interactions
CREATE POLICY "Staff can view interactions"
  ON public.interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert interactions"
  ON public.interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update interactions"
  ON public.interactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete interactions"
  ON public.interactions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- crm_actions
CREATE POLICY "Staff can view crm actions"
  ON public.crm_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert crm actions"
  ON public.crm_actions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update crm actions"
  ON public.crm_actions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete crm actions"
  ON public.crm_actions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- tasks
CREATE POLICY "Staff can view tasks"
  ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert tasks"
  ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));