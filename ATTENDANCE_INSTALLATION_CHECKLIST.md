# Attendance Tracking System - Installation Checklist

## 📦 Step 1: Install Dependencies

The attendance system requires `date-fns` for date/time handling:

```bash
npm install date-fns
```

**Why?** The following files use date-fns:
- `time-display.tsx` - Date/time formatting
- `attendance-clock-in-out.tsx` - Real-time clock
- `attendance-history.tsx` - Date range calculations
- `attendance-reports.tsx` - Monthly report dates
- `form-attendance.tsx` - Form date handling

## 🗄️ Step 2: Run Database Migration

Execute the migration file:

```bash
# Option 1: Supabase Dashboard
# - Go to SQL Editor
# - Copy/paste contents of src/migrations/003-attendance.sql
# - Click Run

# Option 2: Supabase CLI
supabase db push
```

## ✅ Step 3: Verification

### 3.1 Check Database Objects Created

```sql
-- Check table exists
SELECT COUNT(*) FROM attendance_records;

-- Check view exists
SELECT COUNT(*) FROM attendance_records_with_employee;

-- Check RLS policies (should return 8 policies)
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'attendance_records';

-- Check indexes (should return 4 indexes)
SELECT indexname FROM pg_indexes WHERE tablename = 'attendance_records';

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgrelid = 'attendance_records'::regclass;
```

### 3.2 Test Employee Functionality

**Prerequisites:**
- Have at least one employee record in `employees` table
- Employee must be linked to a user account (user_id IS NOT NULL)
- User must have role 'employee' in profiles table

**Test Clock-In:**
```typescript
// Login as employee
// Navigate to: /employee-attendance
// Click "Clock In" button
// Expected: Success toast, record created
// Verify in DB:
SELECT * FROM attendance_records WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND date = CURRENT_DATE;
```

**Test Clock-Out:**
```typescript
// After clock-in
// Click "Clock Out" button
// Expected: Success toast, clock_out timestamp updated
// Verify in DB:
SELECT clock_in, clock_out FROM attendance_records WHERE employee_id = 'YOUR_EMPLOYEE_ID' AND date = CURRENT_DATE;
```

**Test History:**
```typescript
// Navigate to: /employee-attendance/history
// Expected: See personal attendance records only
// Test filters: This Week, This Month, etc.
// Test CSV export
```

### 3.3 Test Admin Functionality

**Prerequisites:**
- User must have role 'admin' in profiles table

**Test View All Records:**
```typescript
// Login as admin
// Navigate to: /admin/attendance
// Expected: See all employees' attendance records
// Test search by employee name
// Test filter by status
```

**Test Create Record:**
```typescript
// Click "Create Record" button
// Fill form with:
//   - Employee: Select any employee
//   - Date: Today or any past date
//   - Clock In: 09:00
//   - Clock Out: 17:00
//   - Status: Present
// Expected: Record created successfully
// Verify in data table
```

**Test Update Record:**
```typescript
// Click dropdown menu on any record
// Click "Edit"
// Modify clock-out time
// Save
// Expected: Record updated in table
```

**Test Delete Record:**
```typescript
// Click dropdown menu on any record
// Click "Delete"
// Confirm deletion
// Expected: Record removed from table
```

**Test Reports:**
```typescript
// Navigate to: /admin/attendance/reports
// Select current month
// Expected: See monthly summary with statistics
// Test CSV export
// Change month filter
// Verify data updates
```

## 🔒 Step 4: Security Verification

### 4.1 Verify RLS Policies

**Test Employee Access Isolation:**
```sql
-- Set role to employee user 1
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'employee-user-1-uuid';

-- Should see only their records
SELECT COUNT(*) FROM attendance_records;
-- Expected: Only records for employee-user-1

-- Try to view another employee's record
SELECT * FROM attendance_records WHERE employee_id = 'other-employee-id';
-- Expected: Empty result
```

**Test Admin Access:**
```sql
-- Set role to admin user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'admin-user-uuid';

-- Should see all records
SELECT COUNT(*) FROM attendance_records;
-- Expected: All records visible
```

### 4.2 Verify Duplicate Prevention

```sql
-- Try to insert duplicate (should fail)
INSERT INTO attendance_records (employee_id, date, clock_in, status)
VALUES ('EXISTING_EMPLOYEE_ID', CURRENT_DATE, NOW(), 'present');
-- Expected: ERROR: duplicate key value violates unique constraint
```

### 4.3 Verify Clock-Out After Clock-In Constraint

```sql
-- Try to insert invalid data (should fail)
INSERT INTO attendance_records (employee_id, date, clock_in, clock_out, status)
VALUES (
  'EMPLOYEE_ID',
  '2024-10-24',
  '2024-10-24 17:00:00',
  '2024-10-24 09:00:00',  -- Clock-out before clock-in
  'present'
);
-- Expected: ERROR: check constraint "clock_out_after_clock_in" violated
```

## 🎨 Step 5: UI/UX Verification

### 5.1 Employee Interface Checklist
- [ ] Real-time clock updates every second
- [ ] Clock-in button disabled after clocking in
- [ ] Clock-out button disabled before clocking in
- [ ] Status badge displays correct color
- [ ] Today's summary shows work duration
- [ ] History page shows personal records only
- [ ] Date filter works correctly
- [ ] CSV export downloads file
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Mobile responsive design works

### 5.2 Admin Interface Checklist
- [ ] Data table displays all records
- [ ] Search filter works
- [ ] Status filter works
- [ ] Pagination works correctly
- [ ] Create dialog opens and closes
- [ ] Employee dropdown populated
- [ ] Form validation works
- [ ] Update dialog pre-fills data
- [ ] Delete confirmation works
- [ ] Reports page loads statistics
- [ ] Month selector works
- [ ] CSV export includes all data
- [ ] Responsive design works

## 📊 Step 6: Data Validation

### 6.1 Create Sample Data

```sql
-- Create test employee if needed
INSERT INTO employees (full_name, position, is_active)
VALUES ('Test Employee', 'Software Engineer', true)
RETURNING id;

-- Create sample attendance records
INSERT INTO attendance_records (employee_id, date, clock_in, clock_out, status)
VALUES
  ('EMPLOYEE_ID', CURRENT_DATE - 7, '2024-10-17 08:55:00', '2024-10-17 17:30:00', 'present'),
  ('EMPLOYEE_ID', CURRENT_DATE - 6, '2024-10-18 09:20:00', '2024-10-18 17:15:00', 'late'),
  ('EMPLOYEE_ID', CURRENT_DATE - 5, '2024-10-19 08:50:00', '2024-10-19 13:00:00', 'half_day'),
  ('EMPLOYEE_ID', CURRENT_DATE - 4, CURRENT_DATE - 4, NULL, 'absent'),
  ('EMPLOYEE_ID', CURRENT_DATE - 3, '2024-10-21 08:58:00', '2024-10-21 17:05:00', 'present');
```

### 6.2 Verify Statistics Calculation

```sql
-- Check statistics calculation
SELECT
  employee_id,
  COUNT(*) as total_days,
  COUNT(*) FILTER (WHERE status = 'present') as present_days,
  COUNT(*) FILTER (WHERE status = 'late') as late_days,
  COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::numeric / COUNT(*)) * 100,
    2
  ) as attendance_rate
FROM attendance_records
WHERE employee_id = 'EMPLOYEE_ID'
GROUP BY employee_id;
```

## 🐛 Step 7: Troubleshooting Common Issues

### Issue 1: "date-fns not found"
**Solution:**
```bash
npm install date-fns
npm run dev
```

### Issue 2: "Employee record not found for this user"
**Solution:**
```sql
-- Link employee to user account
UPDATE employees
SET user_id = 'USER_ID_FROM_AUTH'
WHERE id = 'EMPLOYEE_ID';
```

### Issue 3: "Permission denied for table attendance_records"
**Solution:**
```sql
-- Verify RLS is enabled
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Check policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'attendance_records';
```

### Issue 4: "Cannot read properties of undefined"
**Solution:**
- Clear browser cache
- Check browser console for exact error
- Verify all imports are correct
- Restart dev server

### Issue 5: Real-time clock not updating
**Solution:**
- Check useEffect cleanup in attendance-clock-in-out.tsx
- Verify no JavaScript errors in console
- Test in incognito mode

### Issue 6: CSV export not working
**Solution:**
- Check browser's download settings
- Verify no popup blocker
- Check console for errors
- Verify data exists before export

## ✨ Step 8: Performance Testing

### 8.1 Load Testing
```sql
-- Insert bulk test data (1000 records)
INSERT INTO attendance_records (employee_id, date, clock_in, clock_out, status)
SELECT
  (SELECT id FROM employees ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - (n || ' days')::interval,
  (CURRENT_DATE - (n || ' days')::interval) + '09:00:00'::time,
  (CURRENT_DATE - (n || ' days')::interval) + '17:00:00'::time,
  (ARRAY['present', 'late', 'half_day'])[floor(random() * 3 + 1)]
FROM generate_series(1, 1000) n;
```

### 8.2 Query Performance
```sql
-- Should use index (check with EXPLAIN ANALYZE)
EXPLAIN ANALYZE
SELECT * FROM attendance_records
WHERE employee_id = 'EMPLOYEE_ID'
AND date BETWEEN '2024-10-01' AND '2024-10-31';

-- Expected: Index Scan on idx_attendance_employee_date
```

## 📋 Step 9: Final Checklist

### Database
- [ ] Migration executed successfully
- [ ] Table created with all columns
- [ ] View created successfully
- [ ] All 8 RLS policies active
- [ ] All 4 indexes created
- [ ] Trigger function working
- [ ] Constraints enforced

### Code
- [ ] All TypeScript files compile without errors
- [ ] No console errors in browser
- [ ] All imports resolve correctly
- [ ] date-fns installed

### Features - Employee
- [ ] Can clock in
- [ ] Can clock out
- [ ] Can view personal history
- [ ] Can filter history
- [ ] Can export CSV
- [ ] Cannot see other employees

### Features - Admin
- [ ] Can view all records
- [ ] Can create records
- [ ] Can update records
- [ ] Can delete records
- [ ] Can filter/search
- [ ] Can view reports
- [ ] Can export CSV

### Security
- [ ] RLS enforces employee isolation
- [ ] Admin has full access
- [ ] Duplicate prevention works
- [ ] Constraint validation works
- [ ] Service role key secure

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states work
- [ ] Error messages clear
- [ ] Success feedback shows
- [ ] Real-time updates work

## 🚀 Step 10: Deployment

### Pre-deployment
```bash
# 1. Install dependencies
npm install date-fns

# 2. Build the application
npm run build

# 3. Check for build errors
# Expected: No errors, successful build

# 4. Test production build locally
npm start
# Visit http://localhost:3000 and test all features
```

### Deployment
```bash
# Deploy to your hosting platform
# e.g., Vercel, Netlify, etc.

# After deployment:
# 1. Run database migration on production
# 2. Test all features in production
# 3. Monitor for errors
```

### Post-deployment
- [ ] Test employee clock-in/out
- [ ] Test admin features
- [ ] Verify RLS in production
- [ ] Check performance
- [ ] Monitor error logs
- [ ] Test on multiple devices

## 📈 Step 11: Monitoring

Set up monitoring for:
1. Clock-in/out success rate
2. Database query performance
3. Error rates
4. User engagement
5. Report generation time

---

## ✅ Success Criteria

The installation is successful when:

1. ✅ Employee can clock in/out successfully
2. ✅ Employee sees only their records
3. ✅ Admin can manage all records
4. ✅ Reports generate correctly
5. ✅ No console errors
6. ✅ Mobile responsive
7. ✅ CSV export works
8. ✅ RLS policies enforced
9. ✅ No duplicate records allowed
10. ✅ Real-time clock updates

---

**Estimated Setup Time**: 30-45 minutes

**Need Help?** Check:
1. ATTENDANCE_IMPLEMENTATION_SUMMARY.md
2. ATTENDANCE_SETUP_GUIDE.md
3. Inline code comments
4. Supabase documentation

---

**Good luck with your installation!** 🎉
