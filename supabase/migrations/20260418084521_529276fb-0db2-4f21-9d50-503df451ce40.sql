-- 1. ORDER STATUS
ALTER TYPE public.order_status RENAME TO order_status_old;
CREATE TYPE public.order_status AS ENUM ('draft', 'new', 'pending_confirmation', 'confirmed', 'on_hold', 'cancelled', 'completed');

ALTER TABLE public.orders ALTER COLUMN order_status DROP DEFAULT;
ALTER TABLE public.orders
  ALTER COLUMN order_status TYPE public.order_status
  USING (
    CASE order_status::text
      WHEN 'new' THEN 'new'
      WHEN 'confirmed' THEN 'confirmed'
      WHEN 'processing' THEN 'confirmed'
      WHEN 'shipped' THEN 'completed'
      WHEN 'delivered' THEN 'completed'
      WHEN 'cancelled' THEN 'cancelled'
      ELSE 'new'
    END
  )::public.order_status;
ALTER TABLE public.orders ALTER COLUMN order_status SET DEFAULT 'new'::public.order_status;
DROP TYPE public.order_status_old;

-- 2. PAYMENT STATUS
ALTER TYPE public.payment_status RENAME TO payment_status_old;
CREATE TYPE public.payment_status AS ENUM ('cod_pending', 'unpaid', 'paid', 'partially_refunded', 'refunded');

ALTER TABLE public.orders ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE public.orders
  ALTER COLUMN payment_status TYPE public.payment_status
  USING (
    CASE payment_status::text
      WHEN 'unpaid' THEN 'unpaid'
      WHEN 'partial' THEN 'unpaid'
      WHEN 'paid' THEN 'paid'
      WHEN 'refunded' THEN 'refunded'
      ELSE 'unpaid'
    END
  )::public.payment_status;
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'unpaid'::public.payment_status;
DROP TYPE public.payment_status_old;

-- 3. FULFILLMENT STATUS
ALTER TYPE public.fulfillment_status RENAME TO fulfillment_status_old;
CREATE TYPE public.fulfillment_status AS ENUM ('not_started', 'preparing', 'packed', 'ready_to_ship', 'shipped', 'out_for_delivery', 'delivered', 'delivery_failed', 'returned');

ALTER TABLE public.orders ALTER COLUMN fulfillment_status DROP DEFAULT;
ALTER TABLE public.orders
  ALTER COLUMN fulfillment_status TYPE public.fulfillment_status
  USING (
    CASE fulfillment_status::text
      WHEN 'pending' THEN 'not_started'
      WHEN 'packing' THEN 'preparing'
      WHEN 'shipped' THEN 'shipped'
      WHEN 'delivered' THEN 'delivered'
      WHEN 'returned' THEN 'returned'
      ELSE 'not_started'
    END
  )::public.fulfillment_status;
ALTER TABLE public.orders ALTER COLUMN fulfillment_status SET DEFAULT 'not_started'::public.fulfillment_status;
DROP TYPE public.fulfillment_status_old;