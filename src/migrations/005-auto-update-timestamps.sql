-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Add trigger for profiles table
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger for employees table
DROP TRIGGER IF EXISTS set_updated_at_employees ON public.employees;
CREATE TRIGGER set_updated_at_employees
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger for attendance_records table (if exists)
DROP TRIGGER IF EXISTS set_updated_at_attendance ON public.attendance_records;
CREATE TRIGGER set_updated_at_attendance
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
