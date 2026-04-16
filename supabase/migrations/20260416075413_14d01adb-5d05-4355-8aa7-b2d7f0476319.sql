
-- Create customer_stage enum
CREATE TYPE public.customer_stage AS ENUM ('lead', 'active', 'inactive', 'vip', 'blocked');

-- Add new columns to customers
ALTER TABLE public.customers
  ADD COLUMN governorate text,
  ADD COLUMN customer_stage public.customer_stage NOT NULL DEFAULT 'lead';
