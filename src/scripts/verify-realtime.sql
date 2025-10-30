-- ============================================
-- SCRIPT VERIFIKASI REALTIME SUPABASE
-- ============================================
-- Jalankan script ini di Supabase SQL Editor untuk memverifikasi
-- bahwa realtime sudah dikonfigurasi dengan benar

-- 1. CHECK: Apakah tabel attendance_records ada?
SELECT
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'attendance_records';

-- Expected Output: Harus ada 1 row dengan tablename = 'attendance_records'
-- Jika tidak ada output, berarti tabel belum dibuat!

-- 2. CHECK: Apakah RLS (Row Level Security) sudah enabled?
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'attendance_records';

-- Expected Output: rowsecurity harus = true
-- Jika false, jalankan: ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- 3. CHECK: Apa saja RLS policies yang ada?
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'attendance_records';

-- Expected Output: Harus ada beberapa policies untuk admin dan employee
-- Jika kosong, berarti RLS policies belum dibuat!

-- 4. CHECK: Apakah tabel sudah ditambahkan ke realtime publication?
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'attendance_records';

-- Expected Output: Harus ada 1 row dengan tablename = 'attendance_records'
-- Jika KOSONG, ini adalah MASALAH UTAMA! Jalankan command di bawah:

-- ============================================
-- FIX: ENABLE REALTIME
-- ============================================
-- Jalankan command ini jika query #4 di atas tidak menghasilkan output:

ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;

-- Setelah menjalankan command di atas, jalankan ulang query #4
-- untuk memastikan tabel sudah ditambahkan

-- 5. CHECK: Apakah ada data di tabel?
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT employee_id) as total_employees
FROM attendance_records;

-- Expected Output: Minimal ada beberapa records untuk testing
-- Jika 0, buat dummy data dulu untuk testing

-- 6. CHECK: Lihat sample data
SELECT
  id,
  employee_id,
  date,
  clock_in,
  clock_out,
  status,
  created_at
FROM attendance_records
ORDER BY created_at DESC
LIMIT 5;

-- Expected Output: Harus muncul 5 data terakhir
-- Jika error permission denied, berarti RLS policy memblokir

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Jika Query #4 menunjukkan tabel BELUM ada di publication:
-- Jalankan ini:
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;

-- Jika Query #6 menunjukkan "permission denied":
-- Berarti user Anda bukan admin. Login sebagai admin dulu, atau
-- jalankan query dengan service role key

-- ============================================
-- TEST REALTIME (Manual)
-- ============================================
-- Setelah semua check di atas PASS, test dengan cara:
-- 1. Buka aplikasi Next.js Anda di 2 browser window
-- 2. Di Browser Console (F12), cek apakah ada log:
--    "[useAttendanceRealtime] ✅ Successfully subscribed"
-- 3. Di window 1, tambah data attendance baru
-- 4. Di window 2, data harus otomatis muncul tanpa refresh
-- 5. Jika tidak muncul, cek console untuk error messages

-- ============================================
-- VERIFY CONNECTION IN CONSOLE
-- ============================================
-- Copy paste code ini di Browser Console untuk test manual:

/*
// PASTE INI DI BROWSER CONSOLE (F12):

const { createClient } = window.supabase || require('@supabase/supabase-js');

// Ganti dengan credentials Anda
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const channel = client
  .channel('test-realtime-attendance')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'attendance_records'
    },
    (payload) => {
      console.log('🎉 Realtime event received!', payload);
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed! Now try INSERT/UPDATE/DELETE data.');
    }
  });

// Sekarang coba tambah data di Supabase Dashboard atau aplikasi
// Console harus print "🎉 Realtime event received!"
*/

-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================
-- Query #1: ✅ 1 row (tabel exists)
-- Query #2: ✅ rowsecurity = true
-- Query #3: ✅ Beberapa policies untuk admin dan employee
-- Query #4: ✅ 1 row (tabel ada di realtime publication) ⚠️ INI PALING PENTING!
-- Query #5: ✅ Ada data untuk testing
-- Query #6: ✅ Data muncul tanpa error

-- Jika semua ✅, maka konfigurasi Supabase sudah BENAR
-- Masalah ada di aplikasi Next.js (client-side)

-- Jika Query #4 ❌ (KOSONG), maka:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
-- Lalu restart Next.js dev server!
