
-- Enums for order statuses
CREATE TYPE public.order_status AS ENUM ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');
CREATE TYPE public.fulfillment_status AS ENUM ('pending', 'packing', 'shipped', 'delivered', 'returned');
CREATE TYPE public.customer_source AS ENUM ('walk_in', 'phone', 'whatsapp', 'website', 'woocommerce', 'referral', 'other');
CREATE TYPE public.order_source AS ENUM ('manual', 'woocommerce', 'phone', 'whatsapp', 'other');

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  primary_phone TEXT NOT NULL,
  primary_phone_normalized TEXT NOT NULL UNIQUE,
  email TEXT,
  city TEXT,
  address TEXT,
  source public.customer_source NOT NULL DEFAULT 'phone',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone_normalized ON public.customers (primary_phone_normalized);
CREATE INDEX idx_customers_full_name ON public.customers USING gin (to_tsvector('arabic', full_name));

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_status public.order_status NOT NULL DEFAULT 'new',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  fulfillment_status public.fulfillment_status NOT NULL DEFAULT 'pending',
  source public.order_source NOT NULL DEFAULT 'manual',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON public.orders (customer_id);
CREATE INDEX idx_orders_status ON public.orders (order_status);
CREATE INDEX idx_orders_created ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============ ORDER_ITEMS ============
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update order items" ON public.order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ ORDER_STATUS_HISTORY ============
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL CHECK (field_name IN ('order_status', 'payment_status', 'fulfillment_status')),
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_history_order ON public.order_status_history (order_id);
CREATE INDEX idx_order_history_created ON public.order_status_history (created_at DESC);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order history" ON public.order_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert order history" ON public.order_status_history FOR INSERT TO authenticated WITH CHECK (true);
