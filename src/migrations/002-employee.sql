CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  position TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional index untuk mempercepat pencarian berdasarkan user_id
CREATE INDEX idx_employees_user_id ON public.employees (user_id);

alter table public.menus enable row level security