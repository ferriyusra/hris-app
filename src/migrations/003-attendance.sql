-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'half_day', 'absent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint to prevent duplicate entries per employee per day
  CONSTRAINT unique_employee_date UNIQUE (employee_id, date),

  -- Constraint to ensure clock_out is after clock_in
  CONSTRAINT clock_out_after_clock_in CHECK (clock_out IS NULL OR clock_out > clock_in)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records (date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance_records (employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records (status);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Employees can view only their own attendance records
CREATE POLICY "Employees can view their own attendance records"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN auth.users u ON e.user_id = u.id
    WHERE e.id = attendance_records.employee_id
    AND u.id = auth.uid()
  )
);

-- RLS Policy: Employees can insert attendance (clock-in) only for themselves
CREATE POLICY "Employees can clock in for themselves"
ON public.attendance_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN auth.users u ON e.user_id = u.id
    WHERE e.id = attendance_records.employee_id
    AND u.id = auth.uid()
  )
);

-- RLS Policy: Employees can update (clock-out) only their own today's record
CREATE POLICY "Employees can clock out their own record"
ON public.attendance_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN auth.users u ON e.user_id = u.id
    WHERE e.id = attendance_records.employee_id
    AND u.id = auth.uid()
    AND attendance_records.date = CURRENT_DATE
  )
);

-- RLS Policy: Admins can view all attendance records
CREATE POLICY "Admins can view all attendance records"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policy: Admins can insert any attendance record
CREATE POLICY "Admins can create any attendance record"
ON public.attendance_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policy: Admins can update any attendance record
CREATE POLICY "Admins can update any attendance record"
ON public.attendance_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policy: Admins can delete any attendance record
CREATE POLICY "Admins can delete any attendance record"
ON public.attendance_records
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on record modification
CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_attendance_updated_at();

-- Create a view for attendance records with employee information
CREATE OR REPLACE VIEW public.attendance_records_with_employee AS
SELECT
  ar.id,
  ar.employee_id,
  ar.date,
  ar.clock_in,
  ar.clock_out,
  ar.status,
  ar.notes,
  ar.created_at,
  ar.updated_at,
  e.full_name AS employee_name,
  e.position AS employee_position,
  CASE
    WHEN ar.clock_out IS NOT NULL THEN
      EXTRACT(EPOCH FROM (ar.clock_out - ar.clock_in)) / 3600
    ELSE NULL
  END AS work_hours
FROM public.attendance_records ar
JOIN public.employees e ON ar.employee_id = e.id;

-- Grant access to the view based on the same RLS policies
ALTER VIEW public.attendance_records_with_employee SET (security_invoker = on);
