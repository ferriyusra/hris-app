-- Create work_time_config table
-- This table stores the work time configuration settings
-- Only one row should exist in this table (singleton pattern)
CREATE TABLE IF NOT EXISTS public.work_time_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '17:00:00',
  late_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  half_day_hours DECIMAL(4,2) NOT NULL DEFAULT 4.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraint to ensure only one row exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_time_config_singleton
  ON public.work_time_config ((id IS NOT NULL));

-- Enable Row Level Security
ALTER TABLE public.work_time_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view, only admins can modify
CREATE POLICY "Everyone can view work time config"
  ON public.work_time_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can update work time config"
  ON public.work_time_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert work time config"
  ON public.work_time_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add trigger for auto-updating updated_at
CREATE TRIGGER set_updated_at_work_time_config
  BEFORE UPDATE ON public.work_time_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default work time configuration
INSERT INTO public.work_time_config (
  work_start_time,
  work_end_time,
  late_threshold_minutes,
  half_day_hours
) VALUES (
  '09:00:00',
  '17:00:00',
  15,
  4.00
)
ON CONFLICT DO NOTHING;

-- Add check constraints for validation
ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_work_time_valid
  CHECK (work_start_time < work_end_time);

ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_late_threshold_positive
  CHECK (late_threshold_minutes >= 0);

ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_half_day_hours_positive
  CHECK (half_day_hours >= 0);
