-- Simplify payroll_runs status to: unpaid, process, paid
-- Remove old approval workflow columns and simplify status flow

-- Update status check constraint
ALTER TABLE public.payroll_runs
  DROP CONSTRAINT IF EXISTS payroll_runs_status_check;

ALTER TABLE public.payroll_runs
  ADD CONSTRAINT payroll_runs_status_check
  CHECK (status IN ('unpaid', 'process', 'paid'));

-- Migrate existing data to new statuses
UPDATE public.payroll_runs SET status = 'unpaid' WHERE status IN ('draft', 'submitted', 'approved', 'rejected');
UPDATE public.payroll_runs SET status = 'paid' WHERE status = 'paid';
UPDATE public.payroll_runs SET status = 'process' WHERE status = 'finalized';

-- Drop approval columns that are no longer needed
ALTER TABLE public.payroll_runs
  DROP COLUMN IF EXISTS submitted_at,
  DROP COLUMN IF EXISTS submitted_by,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS rejected_at,
  DROP COLUMN IF EXISTS rejected_by,
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS finalized_by,
  DROP COLUMN IF EXISTS notes;

-- Drop unused indexes
DROP INDEX IF EXISTS idx_payroll_runs_submitted_by;
DROP INDEX IF EXISTS idx_payroll_runs_approved_by;

-- Update RLS policy for employees to view payroll runs with process/paid status
DROP POLICY IF EXISTS "Employees can view finalized payroll runs" ON public.payroll_runs;

CREATE POLICY "Employees can view process and paid payroll runs"
  ON public.payroll_runs FOR SELECT
  TO authenticated
  USING (
    status IN ('process', 'paid')
  );
