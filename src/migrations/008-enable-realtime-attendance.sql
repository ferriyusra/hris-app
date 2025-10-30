-- Enable Realtime for attendance_records table
-- This allows clients to subscribe to real-time changes (INSERT, UPDATE, DELETE) on the attendance_records table

-- Enable realtime replication for the attendance_records table
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;

-- Note: After running this migration, you need to ensure that in your Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Check if 'attendance_records' table is enabled for realtime
-- 3. If not, toggle it on in the Supabase UI
--
-- Alternatively, you can run this in the SQL Editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
