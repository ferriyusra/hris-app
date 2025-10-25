'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface EmployeeStats {
	totalDays: number;
	presentDays: number;
	lateDays: number;
	absentDays: number;
	attendanceRate: number;
	punctualityRate: number;
}

export interface MonthlyTrend {
	date: string;
	status: 'present' | 'late' | 'absent';
	clock_in?: string;
	clock_out?: string;
}

/**
 * Get employee's monthly attendance statistics
 */
export async function getEmployeeMonthlyStats(): Promise<{
	data: EmployeeStats | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient();
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('profile');

		if (!profileCookie) {
			return { data: null, error: 'Not authenticated' };
		}

		const profile = JSON.parse(profileCookie.value);

		// Get employee record
		const { data: employee } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', profile.id)
			.single();

		if (!employee) {
			return { data: null, error: 'Employee record not found' };
		}

		// Get current month's date range
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		const firstDayStr = firstDay.toISOString().split('T')[0];
		const lastDayStr = lastDay.toISOString().split('T')[0];

		// Get attendance records for current month
		const { data: attendanceRecords } = await supabase
			.from('attendance_records')
			.select('status, date')
			.eq('employee_id', employee.id)
			.gte('date', firstDayStr)
			.lte('date', lastDayStr);

		// Calculate working days in current month (excluding weekends)
		let workingDays = 0;
		const currentDate = new Date(firstDay);
		const today = new Date();

		while (currentDate <= today && currentDate <= lastDay) {
			const dayOfWeek = currentDate.getDay();
			// Skip Sunday (0) and Saturday (6)
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				workingDays++;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		const presentDays = attendanceRecords?.filter((r) => r.status === 'present').length || 0;
		const lateDays = attendanceRecords?.filter((r) => r.status === 'late').length || 0;
		const totalPresent = presentDays + lateDays;
		const absentDays = workingDays - totalPresent;

		const attendanceRate = workingDays > 0 ? (totalPresent / workingDays) * 100 : 0;
		const punctualityRate = totalPresent > 0 ? (presentDays / totalPresent) * 100 : 100;

		return {
			data: {
				totalDays: workingDays,
				presentDays,
				lateDays,
				absentDays,
				attendanceRate: Math.round(attendanceRate * 10) / 10,
				punctualityRate: Math.round(punctualityRate * 10) / 10,
			},
			error: null,
		};
	} catch (error) {
		console.error('getEmployeeMonthlyStats error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch employee stats',
		};
	}
}

/**
 * Get employee's attendance trends for last 30 days
 */
export async function getEmployeeAttendanceTrends(): Promise<{
	data: MonthlyTrend[] | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient();
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('profile');

		if (!profileCookie) {
			return { data: null, error: 'Not authenticated' };
		}

		const profile = JSON.parse(profileCookie.value);

		// Get employee record
		const { data: employee } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', profile.id)
			.single();

		if (!employee) {
			return { data: null, error: 'Employee record not found' };
		}

		// Get last 30 days
		const trends: MonthlyTrend[] = [];
		const today = new Date();

		for (let i = 29; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			const dayOfWeek = date.getDay();

			// Skip weekends
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				continue;
			}

			const { data: attendance } = await supabase
				.from('attendance_records')
				.select('status, clock_in, clock_out')
				.eq('employee_id', employee.id)
				.eq('date', dateStr)
				.single();

			if (attendance) {
				// Format times for display
				const clockInTime = attendance.clock_in
					? new Date(attendance.clock_in).toLocaleTimeString('id-ID', {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
					  })
					: undefined;

				const clockOutTime = attendance.clock_out
					? new Date(attendance.clock_out).toLocaleTimeString('id-ID', {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
					  })
					: undefined;

				trends.push({
					date: dateStr,
					status: attendance.status as 'present' | 'late',
					clock_in: clockInTime,
					clock_out: clockOutTime,
				});
			} else {
				// Only mark as absent if the date is in the past
				if (date < today) {
					trends.push({
						date: dateStr,
						status: 'absent',
					});
				}
			}
		}

		return { data: trends, error: null };
	} catch (error) {
		console.error('getEmployeeAttendanceTrends error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch attendance trends',
		};
	}
}
