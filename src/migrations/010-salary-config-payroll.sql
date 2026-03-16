-- Create salary_configs table
CREATE TABLE IF NOT EXISTS public.salary_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER CHECK (year >= 2020),
  base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(15,2) DEFAULT 0,
  meal_allowance DECIMAL(15,2) DEFAULT 0,
  late_deduction_per_day DECIMAL(15,2) DEFAULT 0,
  absent_deduction_per_day DECIMAL(15,2) DEFAULT 0,
  half_day_deduction_per_day DECIMAL(15,2) DEFAULT 0,
  overtime_rate_per_hour DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- Create payroll_runs table
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid')),
  created_by UUID REFERENCES auth.users(id),
  finalized_at TIMESTAMPTZ,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Create payslips table
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_allowances DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  overtime_pay DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  late_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  half_days INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
  midtrans_transaction_id TEXT,
  midtrans_payment_url TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payroll_run_id, employee_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_salary_configs_employee ON public.salary_configs(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_configs_year ON public.salary_configs(year);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON public.payroll_runs(year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON public.payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_run ON public.payslips(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON public.payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_payment_status ON public.payslips(payment_status);

-- Enable Row Level Security
ALTER TABLE public.salary_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salary_configs
CREATE POLICY "Admins can manage salary configs"
  ON public.salary_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payroll_runs
CREATE POLICY "Admins can manage payroll runs"
  ON public.payroll_runs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payslips
CREATE POLICY "Admins can manage all payslips"
  ON public.payslips FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own payslips"
  ON public.payslips FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy for employees to read payroll_runs (needed for payslip period info)
CREATE POLICY "Employees can view finalized payroll runs"
  ON public.payroll_runs FOR SELECT
  TO authenticated
  USING (
    status IN ('finalized', 'paid')
  );

-- Add triggers for auto-updating updated_at
CREATE TRIGGER set_updated_at_salary_configs
  BEFORE UPDATE ON public.salary_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payroll_runs
  BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payslips
  BEFORE UPDATE ON public.payslips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
