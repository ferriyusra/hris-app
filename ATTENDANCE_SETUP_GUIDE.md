# Attendance Tracking System - Quick Setup Guide

## Prerequisites
- Supabase project set up
- Database connection configured
- Required tables: `employees`, `profiles`

## Setup Steps

### Step 1: Run Database Migration

Execute the attendance tracking database migration:

**Option A: Via Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open file: `src/migrations/003-attendance.sql`
4. Copy and paste the entire content
5. Click "Run" to execute

**Option B: Via Supabase CLI**
```bash
# Make sure you're in the project root
cd e:\workspace\programming\project\hris-app

# Apply the migration
supabase db push

# OR if using migration files
supabase migration up
```

### Step 2: Verify Database Schema

Check that the following were created:

**Table**: `attendance_records`
```sql
SELECT * FROM attendance_records LIMIT 1;
```

**View**: `attendance_records_with_employee`
```sql
SELECT * FROM attendance_records_with_employee LIMIT 1;
```

**Policies**: Check RLS policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'attendance_records';
```

### Step 3: Test Employee Access

**Create a test employee** (if not exists):
```sql
-- First, create a user in Supabase Auth (via Dashboard)
-- Then link it to an employee:
UPDATE employees
SET user_id = 'YOUR_USER_ID_FROM_AUTH'
WHERE id = 'YOUR_EMPLOYEE_ID';
```

**Test clock-in** as employee:
1. Login with employee credentials
2. Navigate to `/employee-attendance`
3. Click "Clock In"
4. Verify record created in database

### Step 4: Test Admin Access

**Login as admin**:
1. Login with admin credentials (role = 'admin' in profiles table)
2. Navigate to `/admin/attendance`
3. Verify you can see all attendance records
4. Test Create/Update/Delete operations

### Step 5: Configure Work Hours (Optional)

Edit `src/constants/attendance-constant.ts`:
```typescript
export const WORK_START_TIME = '09:00';           // Your work start time
export const LATE_THRESHOLD_MINUTES = 15;         // Minutes before marked late
export const WORK_END_TIME = '17:00';             // Your work end time
export const HALF_DAY_HOURS = 4;                  // Hours for half day
```

## Routes

### Employee Routes:
- `/employee-attendance` - Clock in/out interface
- `/employee-attendance/history` - Personal attendance history

### Admin Routes:
- `/admin/attendance` - Attendance management
- `/admin/attendance/reports` - Monthly reports and analytics

## Troubleshooting

### Issue: "Employee record not found"
**Solution**: Ensure your user account is linked to an employee record:
```sql
SELECT * FROM employees WHERE user_id = auth.uid();
```

### Issue: "Permission denied"
**Solution**: Check RLS policies are enabled:
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'attendance_records';
```

### Issue: Cannot see attendance records
**Solution**: Verify your role in profiles table:
```sql
SELECT role FROM profiles WHERE id = auth.uid();
```

### Issue: Duplicate clock-in error
**Solution**: This is expected. Each employee can only clock in once per day.
Check existing record:
```sql
SELECT * FROM attendance_records
WHERE employee_id = 'YOUR_EMPLOYEE_ID'
AND date = CURRENT_DATE;
```

## Sample Data (For Testing)

```sql
-- Create sample attendance records (Admin only)
INSERT INTO attendance_records (employee_id, date, clock_in, clock_out, status)
VALUES
  ('EMPLOYEE_ID_1', CURRENT_DATE - 1, '2024-10-23 08:55:00', '2024-10-23 17:30:00', 'present'),
  ('EMPLOYEE_ID_1', CURRENT_DATE - 2, '2024-10-22 09:20:00', '2024-10-22 17:15:00', 'late'),
  ('EMPLOYEE_ID_2', CURRENT_DATE - 1, '2024-10-23 08:50:00', '2024-10-23 17:00:00', 'present');
```

## Verification Checklist

- [ ] Database migration executed successfully
- [ ] Table `attendance_records` created
- [ ] View `attendance_records_with_employee` created
- [ ] RLS policies are active
- [ ] Indexes created for performance
- [ ] Employee can clock in/out
- [ ] Employee can view only their records
- [ ] Admin can view all records
- [ ] Admin can create/update/delete records
- [ ] Reports page loads without errors
- [ ] CSV export works

## Security Notes

1. **Row Level Security (RLS)** is CRITICAL. Do not disable it.
2. **Service Role Key** is used for admin operations. Keep it secret.
3. **Anon Key** is used for employee operations. It's safe to expose.
4. Employees can only access their own data via RLS policies.
5. All mutations require authentication.

## Performance Tips

1. The system is optimized for up to 1000 employees
2. For larger organizations, consider:
   - Partitioning by date
   - Archiving old records
   - Adding more specific indexes

## Next Steps

After setup:
1. ✅ Configure work hours in constants
2. ✅ Update sidebar navigation (if needed)
3. ✅ Test with real user accounts
4. ✅ Configure notifications (optional)
5. ✅ Set up backup strategy
6. ✅ Train users on the system

## Support

If you encounter issues:
1. Check database logs in Supabase Dashboard
2. Review RLS policies
3. Verify user roles in profiles table
4. Check browser console for errors
5. Review network requests in DevTools

---

**Ready to use!** 🚀

The attendance tracking system is now fully functional and ready for production use.
