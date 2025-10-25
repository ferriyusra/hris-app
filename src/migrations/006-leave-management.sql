-- Create leave_types table
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_days_per_year INTEGER NOT NULL DEFAULT 12,
  requires_approval BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 12,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON public.leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON public.leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_types
CREATE POLICY "Everyone can view active leave types"
  ON public.leave_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only admins can manage leave types"
  ON public.leave_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for leave_balances
CREATE POLICY "Employees can view their own leave balances"
  ON public.leave_balances FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all leave balances"
  ON public.leave_balances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage leave balances"
  ON public.leave_balances FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for leave_requests
CREATE POLICY "Employees can view their own leave requests"
  ON public.leave_requests FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can create their own leave requests"
  ON public.leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their pending leave requests"
  ON public.leave_requests FOR UPDATE
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE user_id = auth.uid()
    )
    AND status = 'pending'
  );

CREATE POLICY "Admins can view all leave requests"
  ON public.leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update leave requests"
  ON public.leave_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add trigger for auto-updating updated_at
CREATE TRIGGER set_updated_at_leave_types
  BEFORE UPDATE ON public.leave_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_leave_balances
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_leave_requests
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update leave balance when request is approved
CREATE OR REPLACE FUNCTION public.update_leave_balance_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if status changed from pending to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update the leave balance
    UPDATE public.leave_balances
    SET used_days = used_days + NEW.total_days
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  -- If status changed from approved to rejected/pending, revert the balance
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.leave_balances
    SET used_days = used_days - NEW.total_days
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_leave_request_status_change
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leave_balance_on_approval();

-- Insert default leave types
INSERT INTO public.leave_types (name, description, max_days_per_year) VALUES
  ('Annual Leave', 'Cuti tahunan', 12),
  ('Sick Leave', 'Cuti sakit', 12),
  ('Personal Leave', 'Cuti pribadi', 3),
  ('Maternity Leave', 'Cuti melahirkan', 90),
  ('Paternity Leave', 'Cuti ayah', 3)
ON CONFLICT (name) DO NOTHING;

-- Note: Leave balances are now manually assigned by admin
-- No auto-initialization trigger
-- Admin must explicitly assign leave types and balances to each employee
