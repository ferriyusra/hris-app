-- Create Employee table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional index untuk mempercepat pencarian berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees (user_id);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
