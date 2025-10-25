import { z } from 'zod';

// Attendance status enum
export const attendanceStatusEnum = z.enum(['present', 'late', 'half_day', 'absent']);

// Clock-in validation schema
export const clockInSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  clock_in: z.string().datetime('Invalid clock-in timestamp'),
  status: attendanceStatusEnum,
  notes: z.string().optional(),
});

// Clock-out validation schema
export const clockOutSchema = z.object({
  id: z.string().uuid('Invalid attendance record ID'),
  clock_out: z.string().datetime('Invalid clock-out timestamp'),
});

// Create attendance (admin) validation schema
export const createAttendanceSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  clock_in: z.string().min(1, 'Clock-in time is required'),
  clock_out: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
});

// Update attendance (admin) validation schema
export const updateAttendanceSchema = z.object({
  id: z.string().uuid('Invalid attendance record ID'),
  employee_id: z.string().min(1, 'Employee is required').optional(),
  date: z.string().min(1, 'Date is required').optional(),
  clock_in: z.string().min(1, 'Clock-in time is required').optional(),
  clock_out: z.string().optional(),
  status: z.string().min(1, 'Status is required').optional(),
  notes: z.string().optional(),
});

// Delete attendance validation schema
export const deleteAttendanceSchema = z.object({
  id: z.string().uuid('Invalid attendance record ID'),
});

// Attendance form schema (for admin forms)
export const attendanceFormSchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    date: z.string().min(1, 'Date is required'),
    clock_in: z.string().min(1, 'Clock-in time is required'),
    clock_out: z.string().optional(),
    status: z.string().min(1, 'Status is required'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // If clock_out is provided, ensure it's after clock_in
      if (data.clock_out && data.clock_in) {
        const clockInDate = new Date(data.clock_in);
        const clockOutDate = new Date(data.clock_out);
        return clockOutDate > clockInDate;
      }
      return true;
    },
    {
      message: 'Clock-out time must be after clock-in time',
      path: ['clock_out'],
    }
  );

// Attendance filter validation schema
export const attendanceFilterSchema = z.object({
  employee_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: attendanceStatusEnum.optional(),
  search: z.string().optional(),
});

// Date range validation schema
export const dateRangeSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format'),
  })
  .refine(
    (data) => {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return toDate >= fromDate;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['to'],
    }
  );

// Monthly report validation schema
export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

// Export types
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type DeleteAttendanceInput = z.infer<typeof deleteAttendanceSchema>;
export type AttendanceFormInput = z.infer<typeof attendanceFormSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type MonthlyReportInput = z.infer<typeof monthlyReportSchema>;
