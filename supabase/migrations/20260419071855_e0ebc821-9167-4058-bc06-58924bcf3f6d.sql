
-- ============================================================
-- Helper function: is_staff
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_users
    WHERE auth_user_id = _user_id AND is_active = true
  )
$$;

-- ============================================================
-- STAFF_USERS: only admins manage; all staff view
-- ============================================================
DROP POLICY IF EXISTS "Authenticated staff can view all staff" ON public.staff_users;
DROP POLICY IF EXISTS "Admins can insert staff" ON public.staff_users;
DROP POLICY IF EXISTS "Admins can update staff" ON public.staff_users;
DROP POLICY IF EXISTS "Admins can delete staff" ON public.staff_users;

CREATE POLICY "Staff can view staff" ON public.staff_users
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage staff insert" ON public.staff_users
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage staff update" ON public.staff_users
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage staff delete" ON public.staff_users
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- USER_ROLES: only admins manage; all staff view
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Staff view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- CUSTOMERS: sales/CS/managers/admins manage; admins delete
-- ============================================================
DROP POLICY IF EXISTS "Staff can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can update customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

CREATE POLICY "Staff view customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Sales+ insert customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Sales+ update customers" ON public.customers
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete customers" ON public.customers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- ORDERS: sales/managers/admins manage; all staff view
-- ============================================================
DROP POLICY IF EXISTS "Staff can view orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Staff view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Sales+ insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Sales+ update orders" ON public.orders
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'operations')
  );
CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- ORDER_ITEMS: same as orders
-- ============================================================
DROP POLICY IF EXISTS "Staff can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;

CREATE POLICY "Staff view order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Sales+ insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Sales+ update order items" ON public.order_items
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete order items" ON public.order_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- ORDER_STATUS_HISTORY: append-only by staff who edit orders
-- ============================================================
DROP POLICY IF EXISTS "Staff can view order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Staff can insert order history" ON public.order_status_history;

CREATE POLICY "Staff view order history" ON public.order_status_history
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert order history" ON public.order_status_history
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- PRODUCTS: sales/managers/admins manage; all staff view
-- ============================================================
DROP POLICY IF EXISTS "Staff can view products" ON public.products;
DROP POLICY IF EXISTS "Staff can insert products" ON public.products;
DROP POLICY IF EXISTS "Staff can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Staff view products" ON public.products
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Sales+ insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Sales+ update products" ON public.products
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SHIPMENTS: operations/managers/admins update; all staff view
-- (existing policies already correct, normalize for consistency)
-- ============================================================
DROP POLICY IF EXISTS "Staff can view shipments" ON public.shipments;
DROP POLICY IF EXISTS "Operations and admins can insert shipments" ON public.shipments;
DROP POLICY IF EXISTS "Operations and admins can update shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can delete shipments" ON public.shipments;

CREATE POLICY "Staff view shipments" ON public.shipments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Ops+ insert shipments" ON public.shipments
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Ops+ update shipments" ON public.shipments
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete shipments" ON public.shipments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SHIPMENT_STATUS_HISTORY
-- ============================================================
DROP POLICY IF EXISTS "Staff can view shipment history" ON public.shipment_status_history;
DROP POLICY IF EXISTS "Operations and admins can insert shipment history" ON public.shipment_status_history;

CREATE POLICY "Staff view shipment history" ON public.shipment_status_history
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Ops+ insert shipment history" ON public.shipment_status_history
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'operations')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- SUPPORT_TICKETS: customer_service/managers/admins manage
-- ============================================================
DROP POLICY IF EXISTS "Staff can view tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff can insert tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON public.support_tickets;

CREATE POLICY "Staff view tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "CS+ insert tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "CS+ update tickets" ON public.support_tickets
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete tickets" ON public.support_tickets
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- TICKET_EVENTS
-- ============================================================
DROP POLICY IF EXISTS "Staff can view ticket events" ON public.ticket_events;
DROP POLICY IF EXISTS "Staff can insert ticket events" ON public.ticket_events;
DROP POLICY IF EXISTS "Admins can delete ticket events" ON public.ticket_events;

CREATE POLICY "Staff view ticket events" ON public.ticket_events
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert ticket events" ON public.ticket_events
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete ticket events" ON public.ticket_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- INTERACTIONS: CS/sales/managers/admins manage; all staff view
-- ============================================================
DROP POLICY IF EXISTS "Staff can view interactions" ON public.interactions;
DROP POLICY IF EXISTS "Staff can insert interactions" ON public.interactions;
DROP POLICY IF EXISTS "Staff can update interactions" ON public.interactions;
DROP POLICY IF EXISTS "Admins can delete interactions" ON public.interactions;

CREATE POLICY "Staff view interactions" ON public.interactions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "CS+ insert interactions" ON public.interactions
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "CS+ update interactions" ON public.interactions
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete interactions" ON public.interactions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- CRM_ACTIONS
-- ============================================================
DROP POLICY IF EXISTS "Staff can view crm actions" ON public.crm_actions;
DROP POLICY IF EXISTS "Staff can insert crm actions" ON public.crm_actions;
DROP POLICY IF EXISTS "Staff can update crm actions" ON public.crm_actions;
DROP POLICY IF EXISTS "Admins can delete crm actions" ON public.crm_actions;

CREATE POLICY "Staff view crm actions" ON public.crm_actions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Sales+CS insert crm actions" ON public.crm_actions
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Sales+CS update crm actions" ON public.crm_actions
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'sales')
    OR public.has_role(auth.uid(), 'customer_service')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins delete crm actions" ON public.crm_actions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- TASKS
-- ============================================================
DROP POLICY IF EXISTS "Staff can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

CREATE POLICY "Staff view tasks" ON public.tasks
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete tasks" ON public.tasks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
