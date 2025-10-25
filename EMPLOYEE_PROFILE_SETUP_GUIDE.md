# Employee Profile Feature - Setup Guide

This guide helps you set up and integrate the "Update Data Diri" (Employee Profile) feature into your HRIS application.

## Overview

The employee profile feature allows employees to update their own personal information including:
- Name
- Profile photo (avatar)
- Phone number

Read-only information displayed:
- Employee ID
- Email
- Position
- Join Date
- Role

## Files Created

### 1. Type Definitions
- `src/types/employee-profile.d.ts` - TypeScript interfaces for profile data and form state

### 2. Validation Schemas
- `src/validations/employee-profile-validation.ts` - Zod schemas for form and server validation

### 3. Server Actions
- `src/app/(dashboard)/employee-profile/actions.ts` - Server actions for fetching and updating profile

### 4. Components
- `src/app/(dashboard)/employee-profile/_components/profile-form.tsx` - Main profile form component

### 5. Pages
- `src/app/(dashboard)/employee-profile/page.tsx` - Employee profile route

### 6. Database Migration
- `src/migrations/004-employee-profile-rls.sql` - RLS policies for employee profile access

## Setup Instructions

### Step 1: Run Database Migration

Execute the RLS policies in your Supabase SQL editor:

```bash
# Option 1: Copy and paste the contents of the migration file
# src/migrations/004-employee-profile-rls.sql into Supabase SQL Editor

# Option 2: If you have Supabase CLI installed
supabase db push
```

The migration creates the following policies:
- `Employees can view their own profile` - SELECT on profiles table
- `Employees can update their own profile` - UPDATE on profiles table
- `Employees can view their own employee record` - SELECT on employees table
- `Employees can update their own employee record` - UPDATE on employees table

### Step 2: Verify RLS Policies

In Supabase Dashboard:
1. Go to **Database → Tables**
2. Select **profiles** table → **RLS Policies**
3. Verify the new policies are enabled
4. Repeat for **employees** table

### Step 3: Add Navigation Link

Update your sidebar navigation to include the employee profile link for employees.

Find your sidebar component (likely `src/components/layout/sidebar.tsx` or similar):

```tsx
// Example: Add to your navigation items
const navigationItems = [
  // ... existing items
  {
    title: 'Update Data Diri',
    href: '/employee-profile',
    icon: UserIcon, // or any icon you prefer
    roles: ['employee'], // Only show for employees
  },
];
```

### Step 4: Test the Feature

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Login as an employee:**
   - Use an employee account (not admin)
   - Navigate to `/employee-profile`

3. **Test the functionality:**
   - ✅ Verify read-only fields are displayed correctly
   - ✅ Try updating name, phone number, and avatar
   - ✅ Verify validation works (try invalid phone number)
   - ✅ Confirm changes are saved successfully
   - ✅ Check toast notifications appear

4. **Test permissions:**
   - ✅ Verify admins are redirected (only employees can access)
   - ✅ Try accessing without authentication (should redirect to login)

## Features

### Profile Information Display

The page shows two cards:

1. **Employee Information (Read-Only)**
   - Employee ID
   - Email
   - Position
   - Join Date (formatted in Indonesian locale)
   - Role

2. **Editable Information**
   - Profile Photo (with preview)
   - Full Name
   - Phone Number (validated for Indonesian format: +62xxx)

### Validation

**Phone Number Format:**
- Must start with +62
- Followed by 8-13 digits
- Example: `+628123456789`

**Client-Side Validation:**
- React Hook Form with Zod resolver
- Real-time validation feedback

**Server-Side Validation:**
- Double validation in server actions
- Prevents bypassing client-side validation

### Security

**RLS Policies:**
- Employees can only view and update their own records
- Policies use `auth.uid()` to ensure data isolation
- Admin access is separate from employee self-service

**Server-Side Protection:**
- Authentication check in server actions
- Role-based access control
- Only allowed fields can be updated (name, phone_number, avatar_url)

### File Upload

**Avatar Upload:**
- Uses existing `uploadFile` action from `@/actions/storage-action`
- Uploads to `images/users/` bucket
- Automatically replaces old avatar when updating
- Supports preview before upload

## API Reference

### Server Actions

#### `getMyProfile()`

Fetches the current user's profile and employee data.

**Returns:**
```typescript
{
  profile: Profile | null;
  employee: Employee | null;
  email: string | null;
  error: string | null;
}
```

#### `updateMyProfile(prevState, formData)`

Updates the current user's profile and employee data.

**Parameters:**
- `prevState`: ProfileFormState
- `formData`: FormData containing name, phone_number, avatar_url

**Returns:**
```typescript
{
  status: 'success' | 'error';
  errors?: {
    name?: string[];
    phone_number?: string[];
    avatar_url?: string[];
    _form?: string[];
  };
}
```

## Troubleshooting

### Issue: "Not authenticated" error
**Solution:** Ensure the user is logged in and session is valid

### Issue: RLS policy violations
**Solution:**
1. Check if RLS policies are enabled in Supabase
2. Verify policies are created correctly
3. Ensure `user_id` in employees table matches authenticated user

### Issue: Phone number validation fails
**Solution:**
- Use Indonesian format: +62xxx
- Remove spaces and dashes
- Example: `+628123456789` not `+62 812-3456-789`

### Issue: Avatar upload fails
**Solution:**
1. Check Supabase storage bucket permissions
2. Verify `images` bucket exists
3. Ensure bucket has public access enabled

### Issue: Page redirects to login
**Solution:**
1. Check if user has employee record linked (`user_id` in employees table)
2. Verify user role is 'employee'
3. Check authentication session

## Integration Checklist

- [ ] Database migration executed
- [ ] RLS policies verified in Supabase
- [ ] Navigation link added to sidebar
- [ ] Tested with employee account
- [ ] Tested validation (phone number format)
- [ ] Tested avatar upload
- [ ] Tested success/error notifications
- [ ] Verified admin redirect works
- [ ] Verified authentication redirect works
- [ ] Tested on mobile/responsive layout

## Next Steps

### Optional Enhancements

1. **Add More Fields:**
   - Address
   - Emergency contact
   - Bank account details

2. **Add Change Password:**
   - Separate section for password change
   - Email verification for security

3. **Activity Log:**
   - Track profile changes
   - Display last updated timestamp

4. **Email Notifications:**
   - Notify admin when employee updates profile
   - Send confirmation email to employee

5. **Profile Completion:**
   - Show progress bar for profile completion
   - Encourage employees to complete all fields

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs for RLS policy violations
3. Verify all files are created correctly
4. Ensure dependencies are installed (`npm install`)

## Summary

The employee profile feature is now ready to use! Employees can:
- View their employment information
- Update their personal contact details
- Upload/change their profile photo
- Receive instant feedback on validation errors

All changes are protected by RLS policies and server-side validation, ensuring data security and integrity.
