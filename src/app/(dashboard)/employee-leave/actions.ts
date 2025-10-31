'use server';

import { createClient } from '@/lib/supabase/server';
import { LeaveRequestFormState } from '@/types/leave';
import { leaveRequestSchema } from '@/validations/leave-validation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Calculate working days between two dates (exclude weekends)
 */
function calculateWorkingDays(startDate: Date, endDate: Date): number {
	let count = 0;
	const current = new Date(startDate);

	while (current <= endDate) {
		const dayOfWeek = current.getDay();
		// Count if not weekend (0 = Sunday, 6 = Saturday)
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}

	return count;
}

/**
 * Create leave request
 */
export async function createLeaveRequest(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		// Debug: Log all form data
		console.log('=== DEBUG Form Data ===');
		console.log('leave_type_id:', formData.get('leave_type_id'));
		console.log('start_date:', formData.get('start_date'));
		console.log('end_date:', formData.get('end_date'));
		console.log('reason:', formData.get('reason'));
		console.log('=== END Form Data ===');

		const validatedFields = leaveRequestSchema.safeParse({
			leave_type_id: formData.get('leave_type_id'),
			start_date: formData.get('start_date'),
			end_date: formData.get('end_date'),
			reason: formData.get('reason'),
		});

		if (!validatedFields.success) {
			console.log('=== VALIDATION ERROR ===');
			console.log('Validation errors:', JSON.stringify(validatedFields.error.flatten(), null, 2));
			console.log('=== END VALIDATION ERROR ===');

			return {
				status: 'error',
				errors: {
					...validatedFields.error.flatten().fieldErrors,
					_form: [],
				},
			};
		}

		const supabase = await createClient();
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('user_profile');

		if (!profileCookie) {
			return {
				status: 'error',
				errors: { _form: ['Not authenticated'] },
			};
		}

		const profile = JSON.parse(profileCookie.value);

		// Get employee record
		const { data: employee, error: employeeError } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', profile.id)
			.single();

		if (employeeError || !employee) {
			return {
				status: 'error',
				errors: { _form: ['Employee record not found'] },
			};
		}

		// Calculate total days
		const startDate = new Date(validatedFields.data.start_date);

		// If no end_date provided (flexible end date for sick leave), use start_date as end_date (1 day)
		// Check for both undefined and empty string
		const hasEndDate = validatedFields.data.end_date &&
			typeof validatedFields.data.end_date === 'string' &&
			validatedFields.data.end_date.trim() !== '';

		const endDate = hasEndDate
			? new Date(validatedFields.data.end_date!)
			: new Date(validatedFields.data.start_date);

		// Debug logging
		console.log('=== DEBUG Leave Request Calculation ===');
		console.log('start_date input:', validatedFields.data.start_date);
		console.log('end_date input:', validatedFields.data.end_date);
		console.log('hasEndDate:', hasEndDate);
		console.log('startDate object:', startDate);
		console.log('endDate object:', endDate);
		console.log('startDate valid?', !isNaN(startDate.getTime()));
		console.log('endDate valid?', !isNaN(endDate.getTime()));

		const totalDays = calculateWorkingDays(startDate, endDate);
		console.log('totalDays calculated:', totalDays);
		console.log('=== END DEBUG ===');

		if (totalDays === 0) {
			return {
				status: 'error',
				errors: { _form: ['Selected dates do not include any working days'] },
			};
		}

		// Check leave balance
		const year = startDate.getFullYear();
		const { data: balance } = await supabase
			.from('leave_balances')
			.select('remaining_days')
			.eq('employee_id', employee.id)
			.eq('leave_type_id', validatedFields.data.leave_type_id)
			.eq('year', year)
			.single();

		if (!balance) {
			return {
				status: 'error',
				errors: { _form: ['Saldo cuti tidak ditemukan untuk tahun ini'] },
			};
		}

		if (balance.remaining_days < totalDays) {
			return {
				status: 'error',
				errors: {
					_form: [
						`Saldo cuti tidak mencukupi. Anda memiliki ${balance.remaining_days} hari tersisa, tetapi diminta ${totalDays} hari.`,
					],
				},
			};
		}

		// Create leave request
		const { error } = await supabase.from('leave_requests').insert({
			employee_id: employee.id,
			leave_type_id: validatedFields.data.leave_type_id,
			start_date: validatedFields.data.start_date,
			end_date: hasEndDate
				? validatedFields.data.end_date!
				: validatedFields.data.start_date, // Use start_date if end_date not provided or empty
			total_days: totalDays,
			reason: validatedFields.data.reason,
			status: 'pending',
		});

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/employee-leave');

		return { status: 'success' };
	} catch (error) {
		console.error('createLeaveRequest error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to create leave request'],
			},
		};
	}
}

/**
 * Get employee's leave requests
 */
export async function getMyLeaveRequests() {
	try {
		const supabase = await createClient();
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('user_profile');

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

		const { data, error } = await supabase
			.from('leave_requests')
			.select(
				`
				*,
				leave_type:leave_types(*)
			`
			)
			.eq('employee_id', employee.id)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getMyLeaveRequests error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch leave requests',
		};
	}
}

/**
 * Get employee's leave balances
 * OPTIMIZED: Select only needed fields
 */
export async function getMyLeaveBalances() {
	try {
		const supabase = await createClient();
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('user_profile');

		console.log('=== DEBUG getMyLeaveBalances START ===');
		console.log('DEBUG: Has profile cookie:', !!profileCookie);

		if (!profileCookie) {
			console.error('DEBUG: No profile cookie found');
			return { data: null, error: 'Not authenticated' };
		}

		const profile = JSON.parse(profileCookie.value);
		console.log('DEBUG: Profile ID:', profile.id);

		// Get employee record - select only id
		const { data: employee, error: employeeError } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', profile.id)
			.single();

		console.log('DEBUG: Employee query result:', { employee, employeeError });

		if (employeeError || !employee) {
			console.error('DEBUG: Employee not found');
			return { data: null, error: 'Employee record not found' };
		}

		const currentYear = new Date().getFullYear();
		console.log('DEBUG: Current year:', currentYear);
		console.log('DEBUG: Employee ID:', employee.id);

		// Select only needed fields from leave_balances and leave_types
		const { data, error } = await supabase
			.from('leave_balances')
			.select(
				`
				id,
				total_days,
				used_days,
				remaining_days,
				year,
				leave_type_id,
				leave_type:leave_types!leave_balances_leave_type_id_fkey(
					id,
					name,
					description,
					allows_flexible_end_date
				)
			`
			)
			.eq('employee_id', employee.id)
			.eq('year', currentYear);

		console.log('DEBUG: Leave balances query result:', {
			dataCount: data?.length,
			data,
			error
		});

		if (error) {
			console.error('DEBUG: Query error:', error);
			throw error;
		}

		console.log('=== DEBUG getMyLeaveBalances END ===');
		return { data, error: null };
	} catch (error) {
		console.error('getMyLeaveBalances error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch leave balances',
		};
	}
}

/**
 * Get active leave types
 */
export async function getActiveLeaveTypes() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('leave_types')
			.select('*')
			.eq('is_active', true)
			.order('name');

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getActiveLeaveTypes error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch leave types',
		};
	}
}

/**
 * Cancel leave request (only if pending)
 */
export async function cancelLeaveRequest(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const supabase = await createClient();
		const id = formData.get('id') as string;

		const { error } = await supabase
			.from('leave_requests')
			.delete()
			.eq('id', id)
			.eq('status', 'pending');

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/employee-leave');

		return { status: 'success' };
	} catch (error) {
		console.error('cancelLeaveRequest error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to cancel leave request'],
			},
		};
	}
}
