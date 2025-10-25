-- Migration: Add RLS policies for employee profile updates
-- Description: Allow employees to read and update their own profile and employee records
-- Date: 2025-10-25

-- ============================================================
-- RLS Policies for PROFILES table
-- ============================================================

-- Policy: Employees can view their own profile
CREATE POLICY IF NOT EXISTS "Employees can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Policy: Employees can update their own profile
CREATE POLICY IF NOT EXISTS "Employees can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- RLS Policies for EMPLOYEES table
-- ============================================================

-- Policy: Employees can view their own employee record
CREATE POLICY IF NOT EXISTS "Employees can view their own employee record"
ON public.employees
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Employees can update their own employee record (limited fields)
-- Note: This allows employees to update their own record, but application logic
-- should ensure only allowed fields (full_name, phone_number) are updated
CREATE POLICY IF NOT EXISTS "Employees can update their own employee record"
ON public.employees
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON POLICY "Employees can view their own profile" ON public.profiles IS
'Allows employees to view their own profile information for the employee profile page';

COMMENT ON POLICY "Employees can update their own profile" ON public.profiles IS
'Allows employees to update their own profile (name, avatar_url) from the employee profile page';

COMMENT ON POLICY "Employees can view their own employee record" ON public.employees IS
'Allows employees to view their own employee record for the employee profile page';

COMMENT ON POLICY "Employees can update their own employee record" ON public.employees IS
'Allows employees to update allowed fields (full_name, phone_number) in their employee record.
Server-side validation ensures only these fields are updated, not position, join_date, etc.';
