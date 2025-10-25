'use server';

import { createClient } from '@/lib/supabase/server';
import { LATE_THRESHOLD_MINUTES, WORK_START_TIME } from '@/constants/attendance-constant';

export interface DashboardStats {
	totalEmployees: number;
	activeEmployees: number;
	inactiveEmployees: number;
	todayPresent: number;
	todayLate: number;
	todayAbsent: number;
}

export interface LateEmployee {
	id: string;
	employee_name: string;
	clock_in: string;
	minutes_late: number;
}

export interface AttendanceTrend {
	date: string;
	present: number;
	late: number;
	absent: number;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
	data: DashboardStats | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient();
		const today = new Date().toISOString().split('T')[0];

		// Get total employees
		const { count: totalEmployees } = await supabase
			.from('employees')
			.select('*', { count: 'exact', head: true });

		// Get active employees
		const { count: activeEmployees } = await supabase
			.from('employees')
			.select('*', { count: 'exact', head: true })
			.eq('is_active', true);

		// Get inactive employees
		const inactiveEmployees = (totalEmployees || 0) - (activeEmployees || 0);

		// Get today's attendance
		const { data: todayAttendance } = await supabase
			.from('attendance_records')
			.select('*, employee:employees!inner(full_name)')
			.eq('date', today);

		// Calculate today's stats
		const todayPresent = todayAttendance?.length || 0;
		const todayLate = todayAttendance?.filter((record) => record.status === 'late').length || 0;

		// Absent = active employees - present
		const todayAbsent = (activeEmployees || 0) - todayPresent;

		return {
			data: {
				totalEmployees: totalEmployees || 0,
				activeEmployees: activeEmployees || 0,
				inactiveEmployees,
				todayPresent,
				todayLate,
				todayAbsent,
			},
			error: null,
		};
	} catch (error) {
		console.error('getDashboardStats error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
		};
	}
}

/**
 * Get today's late employees
 */
export async function getTodayLateEmployees(): Promise<{
	data: LateEmployee[] | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient();
		const today = new Date().toISOString().split('T')[0];

		const { data, error } = await supabase
			.from('attendance_records')
			.select(`
				id,
				clock_in,
				employee:employees!inner(full_name)
			`)
			.eq('date', today)
			.eq('status', 'late')
			.order('clock_in', { ascending: false });

		if (error) throw error;

		// Calculate minutes late for each employee
		const lateEmployees: LateEmployee[] = (data || []).map((record) => {
			// clock_in is already a full timestamp, parse it directly
			const clockInTime = new Date(record.clock_in);
			const workStartTime = new Date(`${today}T${WORK_START_TIME}`);
			const minutesLate = Math.floor((clockInTime.getTime() - workStartTime.getTime()) / 60000);

			// Format clock_in time for display (HH:MM)
			const displayTime = clockInTime.toLocaleTimeString('id-ID', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			});

			return {
				id: record.id,
				employee_name: (record.employee as any).full_name,
				clock_in: displayTime,
				minutes_late: minutesLate,
			};
		});

		return { data: lateEmployees, error: null };
	} catch (error) {
		console.error('getTodayLateEmployees error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch late employees',
		};
	}
}

/**
 * Get attendance trends for the last 7 days
 */
export async function getAttendanceTrends(): Promise<{
	data: AttendanceTrend[] | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient();

		// Get active employees count
		const { count: activeEmployees } = await supabase
			.from('employees')
			.select('*', { count: 'exact', head: true })
			.eq('is_active', true);

		// Get last 7 days
		const trends: AttendanceTrend[] = [];
		const today = new Date();

		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];

			const { data: attendance } = await supabase
				.from('attendance_records')
				.select('status')
				.eq('date', dateStr);

			const present = attendance?.length || 0;
			const late = attendance?.filter((r) => r.status === 'late').length || 0;
			const absent = (activeEmployees || 0) - present;

			trends.push({
				date: dateStr,
				present,
				late,
				absent,
			});
		}

		return { data: trends, error: null };
	} catch (error) {
		console.error('getAttendanceTrends error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch attendance trends',
		};
	}
}
