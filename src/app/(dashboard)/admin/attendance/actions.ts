'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
	AttendanceFormState,
	AttendanceRecordWithEmployee,
	AttendanceRecord,
	MonthlyAttendanceSummary,
} from '@/types/attendance';
import {
	attendanceFormSchema,
	deleteAttendanceSchema,
} from '@/validations/attendance-validation';

/**
 * Get all attendance records with employee information (Admin only)
 */
export async function getAllAttendance(params?: {
	employeeId?: string;
	dateFrom?: string;
	dateTo?: string;
	status?: string;
	search?: string;
	limit?: number;
	offset?: number;
}): Promise<{
	data: AttendanceRecordWithEmployee[] | null;
	count: number | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient({ isAdmin: true });

		// Use direct join instead of view for now
		let query = supabase
			.from('attendance_records')
			.select(`
				*,
				employee:employees!inner(
					id,
					full_name,
					position
				)
			`, { count: 'exact' })
			.order('date', { ascending: false });

		if (params?.employeeId) {
			query = query.eq('employee_id', params.employeeId);
		}

		if (params?.dateFrom) {
			query = query.gte('date', params.dateFrom);
		}

		if (params?.dateTo) {
			query = query.lte('date', params.dateTo);
		}

		if (params?.status) {
			query = query.eq('status', params.status);
		}

		if (params?.search) {
			query = query.ilike('employee.full_name', `%${params.search}%`);
		}

		if (params?.limit && params?.offset !== undefined) {
			query = query.range(
				params.offset,
				params.offset + params.limit - 1
			);
		}

		const { data, count, error } = await query;

		if (error) {
			return { data: null, count: null, error: error.message };
		}

		// Transform data to match AttendanceRecordWithEmployee type
		const transformedData = data?.map((record: any) => ({
			...record,
			employee_name: record.employee?.full_name || '',
			employee_position: record.employee?.position || '',
			work_hours: record.clock_out && record.clock_in
				? (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60)
				: null,
		})) || [];

		return {
			data: transformedData as AttendanceRecordWithEmployee[],
			count,
			error: null,
		};
	} catch (error) {
		return {
			data: null,
			count: null,
			error:
				error instanceof Error
					? error.message
					: 'Failed to fetch attendance records',
		};
	}
}

/**
 * Create attendance record (Admin only)
 */
export async function createAttendance(
	prevState: AttendanceFormState,
	formData: FormData
): Promise<AttendanceFormState> {
	try {
		const validatedFields = attendanceFormSchema.safeParse({
			employee_id: formData.get('employee_id'),
			date: formData.get('date'),
			clock_in: formData.get('clock_in'),
			clock_out: formData.get('clock_out') || undefined,
			status: formData.get('status'),
			notes: formData.get('notes') || undefined,
		});

		if (!validatedFields.success) {
			return {
				status: 'error',
				errors: {
					...validatedFields.error.flatten().fieldErrors,
					_form: [],
				},
			};
		}

		const supabase = await createClient({ isAdmin: true });

		// Check for duplicate entry
		const { data: existing } = await supabase
			.from('attendance_records')
			.select('id')
			.eq('employee_id', validatedFields.data.employee_id)
			.eq('date', validatedFields.data.date)
			.single();

		if (existing) {
			return {
				status: 'error',
				errors: {
					_form: [
						'An attendance record already exists for this employee on this date',
					],
				},
			};
		}

		const { error } = await supabase.from('attendance_records').insert({
			employee_id: validatedFields.data.employee_id,
			date: validatedFields.data.date,
			clock_in: validatedFields.data.clock_in,
			clock_out: validatedFields.data.clock_out || null,
			status: validatedFields.data.status,
			notes: validatedFields.data.notes || null,
		});

		if (error) {
			return {
				status: 'error',
				errors: {
					_form: [error.message],
				},
			};
		}

		revalidatePath('/admin/attendance');
		revalidatePath('/admin/attendance/reports');

		return {
			status: 'success',
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: 'Failed to create attendance record',
				],
			},
		};
	}
}

/**
 * Update attendance record (Admin only)
 */
export async function updateAttendance(
	prevState: AttendanceFormState,
	formData: FormData
): Promise<AttendanceFormState> {
	try {
		const validatedFields = attendanceFormSchema.safeParse({
			employee_id: formData.get('employee_id'),
			date: formData.get('date'),
			clock_in: formData.get('clock_in'),
			clock_out: formData.get('clock_out') || undefined,
			status: formData.get('status'),
			notes: formData.get('notes') || undefined,
		});

		if (!validatedFields.success) {
			return {
				status: 'error',
				errors: {
					...validatedFields.error.flatten().fieldErrors,
					_form: [],
				},
			};
		}

		const supabase = await createClient({ isAdmin: true });

		const { error } = await supabase
			.from('attendance_records')
			.update({
				date: validatedFields.data.date,
				clock_in: validatedFields.data.clock_in,
				clock_out: validatedFields.data.clock_out || null,
				status: validatedFields.data.status,
				notes: validatedFields.data.notes || null,
			})
			.eq('id', formData.get('id'));

		if (error) {
			return {
				status: 'error',
				errors: {
					_form: [error.message],
				},
			};
		}

		revalidatePath('/admin/attendance');
		revalidatePath('/admin/attendance/reports');

		return {
			status: 'success',
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: 'Failed to update attendance record',
				],
			},
		};
	}
}

/**
 * Delete attendance record (Admin only)
 */
export async function deleteAttendance(
	prevState: AttendanceFormState,
	formData: FormData
): Promise<AttendanceFormState> {
	try {
		const validatedFields = deleteAttendanceSchema.safeParse({
			id: formData.get('id'),
		});

		if (!validatedFields.success) {
			return {
				status: 'error',
				errors: {
					...validatedFields.error.flatten().fieldErrors,
					_form: [],
				},
			};
		}

		const supabase = await createClient({ isAdmin: true });

		const { error } = await supabase
			.from('attendance_records')
			.delete()
			.eq('id', validatedFields.data.id);

		if (error) {
			return {
				status: 'error',
				errors: {
					_form: [error.message],
				},
			};
		}

		revalidatePath('/admin/attendance');
		revalidatePath('/admin/attendance/reports');

		return {
			status: 'success',
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: 'Failed to delete attendance record',
				],
			},
		};
	}
}

/**
 * Get monthly attendance summary for all employees (Admin only)
 */
export async function getMonthlyAttendanceSummary(
	month: string
): Promise<{
	data: MonthlyAttendanceSummary[] | null;
	error: string | null;
}> {
	try {
		const supabase = await createClient({ isAdmin: true });

		// Get all employees
		const { data: employees, error: employeesError } = await supabase
			.from('employees')
			.select('id, full_name, position')
			.eq('is_active', true);

		if (employeesError) {
			return { data: null, error: employeesError.message };
		}

		// Get attendance records - if month is 'all', get all records, otherwise filter by month
		let records;
		let recordsError;

		if (month === 'all') {
			// Get all attendance records
			const result = await supabase
				.from('attendance_records')
				.select('*');
			records = result.data;
			recordsError = result.error;
		} else {
			// Get records for specific month
			const [year, monthNum] = month.split('-');
			const startDate = `${year}-${monthNum}-01`;
			const yearInt = parseInt(year);
			const monthInt = parseInt(monthNum);
			const lastDay = new Date(yearInt, monthInt, 0).getDate();
			const endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`;

			const result = await supabase
				.from('attendance_records')
				.select('*')
				.gte('date', startDate)
				.lte('date', endDate);
			records = result.data;
			recordsError = result.error;
		}

		if (recordsError) {
			return { data: null, error: recordsError.message };
		}

		// Calculate summary for each employee
		const summary: MonthlyAttendanceSummary[] = employees
			.map((employee) => {
				const employeeRecords = records?.filter(
					(r) => r.employee_id === employee.id
				);

				const totalDays = employeeRecords?.length;
				const presentDays = employeeRecords?.filter(
					(r) => r.status === 'present'
				).length;
				const lateDays = employeeRecords?.filter(
					(r) => r.status === 'late'
				).length;
				const halfDays = employeeRecords?.filter(
					(r) => r.status === 'half_day'
				).length;
				const absentDays = employeeRecords?.filter(
					(r) => r.status === 'absent'
				).length;

				// Calculate total work hours
				let totalWorkHours = 0;
				employeeRecords?.forEach((record) => {
					if (record.clock_in && record.clock_out) {
						const clockIn = new Date(record.clock_in);
						const clockOut = new Date(record.clock_out);
						const hours =
							(clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
						totalWorkHours += hours;
					}
				});

				const attendanceRate =
					totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

				return {
					employee_id: employee.id,
					employee_name: employee.full_name,
					employee_position: employee.position,
					month,
					total_days: totalDays,
					present_days: presentDays,
					late_days: lateDays,
					half_days: halfDays,
					absent_days: absentDays,
					attendance_rate: Math.round(attendanceRate * 100) / 100,
					total_work_hours: Math.round(totalWorkHours * 100) / 100,
				};
			})
			.filter((emp) => emp.total_days > 0); // Only include employees with attendance records

		return { data: summary, error: null };
	} catch (error) {
		return {
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'Failed to fetch monthly summary',
		};
	}
}
