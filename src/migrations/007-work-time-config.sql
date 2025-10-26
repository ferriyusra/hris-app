-- Membuat tabel work_time_config
-- Tabel ini menyimpan pengaturan konfigurasi waktu kerja
-- Hanya satu baris yang harus ada di tabel ini (pola singleton)
CREATE TABLE IF NOT EXISTS public.work_time_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '17:00:00',
  late_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  half_day_hours DECIMAL(4,2) NOT NULL DEFAULT 4.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menambahkan constraint untuk memastikan hanya satu baris yang ada
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_time_config_singleton
  ON public.work_time_config ((id IS NOT NULL));

-- Mengaktifkan Row Level Security
ALTER TABLE public.work_time_config ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS - Semua orang dapat melihat, hanya admin yang dapat mengubah
CREATE POLICY "Semua orang dapat melihat konfigurasi waktu kerja"
  ON public.work_time_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hanya admin yang dapat mengubah konfigurasi waktu kerja"
  ON public.work_time_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Hanya admin yang dapat menambahkan konfigurasi waktu kerja"
  ON public.work_time_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Menambahkan trigger untuk auto-update updated_at
CREATE TRIGGER set_updated_at_work_time_config
  BEFORE UPDATE ON public.work_time_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Memasukkan konfigurasi waktu kerja default
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

-- Menambahkan constraint validasi
ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_work_time_valid
  CHECK (work_start_time < work_end_time);

ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_late_threshold_positive
  CHECK (late_threshold_minutes >= 0);

ALTER TABLE public.work_time_config
  ADD CONSTRAINT check_half_day_hours_positive
  CHECK (half_day_hours >= 0);
