'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
	LATE_THRESHOLD_MINUTES,
	WORK_START_TIME,
} from '@/constants/attendance-constant';
import type {
	AttendanceFormState,
	AttendanceRecord,
	AttendanceStats,
	AttendanceTodayStatus,
} from '@/types/attendance';

/**
 * Get current employee's ID from their user account
 */
async function getCurrentEmployeeId() {
	const supabase = await createClient();

	// Get current user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		throw new Error('User not authenticated');
	}

	// Get employee record associated with this user
	const { data: employee, error: employeeError } = await supabase
		.from('employees')
		.select('id')
		.eq('user_id', user.id)
		.single();

	if (employeeError || !employee) {
		throw new Error('Employee record not found for this user');
	}

	return employee.id;
}

/**
 * Calculate attendance status based on clock-in time
 */
function calculateStatus(clockInTime: string): 'present' | 'late' {
	const clockIn = new Date(clockInTime);
	const [hours, minutes] = WORK_START_TIME.split(':').map(Number);

	// Create a date object for work start time on the same day
	const workStart = new Date(clockIn);
	workStart.setHours(hours, minutes, 0, 0);

	// Calculate difference in minutes
	const diffMinutes = (clockIn.getTime() - workStart.getTime()) / (1000 * 60);

	// If clocked in more than LATE_THRESHOLD_MINUTES after work start time, mark as late
	return diffMinutes > LATE_THRESHOLD_MINUTES ? 'late' : 'present';
}

/**
 * Get today's attendance status for the current employee
 */
export async function getTodayAttendance(): Promise<AttendanceTodayStatus> {
	try {
		const employeeId = await getCurrentEmployeeId();
		const supabase = await createClient();

		const today = new Date().toISOString().split('T')[0];

		const { data, error } = await supabase
			.from('attendance_records')
			.select('*')
			.eq('employee_id', employeeId)
			.eq('date', today)
			.single();

		if (error && error.code !== 'PGRST116') {
			// PGRST116 is "no rows returned"
			throw error;
		}

		return {
			has_record: !!data,
			is_clocked_in: !!data?.clock_in,
			is_clocked_out: !!data?.clock_out,
			record: data as AttendanceRecord | null,
		};
	} catch (error) {
		console.error('Error fetching today attendance:', error);
		throw error;
	}
}

/**
 * Clock in for the current employee
 */
export async function clockIn(
	prevState: AttendanceFormState,
	formData: FormData
): Promise<AttendanceFormState> {
	try {
		const employeeId = await getCurrentEmployeeId();
		const supabase = await createClient();

		const today = new Date().toISOString().split('T')[0];
		const now = new Date().toISOString();

		// Check if already clocked in today
		const { data: existing } = await supabase
			.from('attendance_records')
			.select('id')
			.eq('employee_id', employeeId)
			.eq('date', today)
			.single();

		if (existing) {
			return {
				status: 'error',
				errors: {
					_form: ['You have already clocked in today'],
				},
			};
		}

		// Determine status based on clock-in time
		const status = calculateStatus(now);

		// Insert attendance record
		const { error } = await supabase.from('attendance_records').insert({
			employee_id: employeeId,
			date: today,
			clock_in: now,
			status: status,
		});

		if (error) {
			return {
				status: 'error',
				errors: {
					_form: [error.message],
				},
			};
		}

		revalidatePath('/employee-attendance');
		revalidatePath('/employee-attendance/history');

		return {
			status: 'success',
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to clock in'],
			},
		};
	}
}

/**
 * Clock out for the current employee
 */
export async function clockOut(
	prevState: AttendanceFormState,
	formData: FormData
): Promise<AttendanceFormState> {
	try {
		const employeeId = await getCurrentEmployeeId();
		const supabase = await createClient();

		const today = new Date().toISOString().split('T')[0];
		const now = new Date().toISOString();

		// Get today's attendance record
		const { data: record, error: fetchError } = await supabase
			.from('attendance_records')
			.select('*')
			.eq('employee_id', employeeId)
			.eq('date', today)
			.single();

		if (fetchError || !record) {
			return {
				status: 'error',
				errors: {
					_form: ['No clock-in record found for today'],
				},
			};
		}

		if (record.clock_out) {
			return {
				status: 'error',
				errors: {
					_form: ['You have already clocked out today'],
				},
			};
		}

		// Update with clock-out time
		const { error } = await supabase
			.from('attendance_records')
			.update({
				clock_out: now,
			})
			.eq('id', record.id);

		if (error) {
			return {
				status: 'error',
				errors: {
					_form: [error.message],
				},
			};
		}

		revalidatePath('/employee-attendance');
		revalidatePath('/employee-attendance/history');

		return {
			status: 'success',
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to clock out'],
			},
		};
	}
}

/**
 * Get attendance history for the current employee
 */
export async function getMyAttendance(params?: {
	dateFrom?: string;
	dateTo?: string;
	limit?: number;
	offset?: number;
}): Promise<{ data: AttendanceRecord[] | null; error: string | null }> {
	try {
		const employeeId = await getCurrentEmployeeId();
		const supabase = await createClient();

		let query = supabase
			.from('attendance_records')
			.select('*')
			.eq('employee_id', employeeId)
			.order('date', { ascending: false });

		if (params?.dateFrom) {
			query = query.gte('date', params.dateFrom);
		}

		if (params?.dateTo) {
			query = query.lte('date', params.dateTo);
		}

		if (params?.limit) {
			query = query.limit(params.limit);
		}

		if (params?.offset) {
			query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
		}

		const { data, error } = await query;

		if (error) {
			return { data: null, error: error.message };
		}

		return { data: data as AttendanceRecord[], error: null };
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch attendance',
		};
	}
}

/**
 * Get attendance statistics for the current employee
 */
export async function getMyAttendanceStats(params?: {
	dateFrom?: string;
	dateTo?: string;
}): Promise<{ data: AttendanceStats | null; error: string | null }> {
	try {
		const employeeId = await getCurrentEmployeeId();
		const supabase = await createClient();

		let query = supabase
			.from('attendance_records')
			.select('*')
			.eq('employee_id', employeeId);

		if (params?.dateFrom) {
			query = query.gte('date', params.dateFrom);
		}

		if (params?.dateTo) {
			query = query.lte('date', params.dateTo);
		}

		const { data, error } = await query;

		if (error) {
			return { data: null, error: error.message };
		}

		const records = data as AttendanceRecord[];

		// Calculate statistics
		const totalDays = records.length;
		const presentDays = records.filter((r) => r.status === 'present').length;
		const lateDays = records.filter((r) => r.status === 'late').length;
		const halfDays = records.filter((r) => r.status === 'half_day').length;
		const absentDays = records.filter((r) => r.status === 'absent').length;

		// Calculate total work hours
		let totalWorkHours = 0;
		records.forEach((record) => {
			if (record.clock_in && record.clock_out) {
				const clockIn = new Date(record.clock_in);
				const clockOut = new Date(record.clock_out);
				const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
				totalWorkHours += hours;
			}
		});

		const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;
		const averageWorkHours = totalDays > 0 ? totalWorkHours / totalDays : 0;

		const stats: AttendanceStats = {
			total_days: totalDays,
			present_days: presentDays,
			late_days: lateDays,
			half_days: halfDays,
			absent_days: absentDays,
			attendance_rate: Math.round(attendanceRate * 100) / 100,
			total_work_hours: Math.round(totalWorkHours * 100) / 100,
			average_work_hours: Math.round(averageWorkHours * 100) / 100,
		};

		return { data: stats, error: null };
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch statistics',
		};
	}
}
