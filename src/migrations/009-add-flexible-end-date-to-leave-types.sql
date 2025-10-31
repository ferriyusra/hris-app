-- Add allows_flexible_end_date to leave_types table
-- This allows certain leave types (like sick leave) to not require an end date upfront
ALTER TABLE public.leave_types
ADD COLUMN IF NOT EXISTS allows_flexible_end_date BOOLEAN DEFAULT FALSE;

-- Update Sick Leave to allow flexible end date
UPDATE public.leave_types
SET allows_flexible_end_date = TRUE
WHERE name = 'Sick Leave';

-- Make end_date nullable in leave_requests
ALTER TABLE public.leave_requests
ALTER COLUMN end_date DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.leave_types.allows_flexible_end_date IS
'When true, employees can submit leave requests without specifying an end date. Useful for sick leave where recovery time is uncertain.';
