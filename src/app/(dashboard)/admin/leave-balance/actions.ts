'use server';

import { createClient } from '@/lib/supabase/server';
import { LeaveRequestFormState } from '@/types/leave';
import { revalidatePath } from 'next/cache';

/**
 * Get all employees with their leave balances for current year
 */
export async function getAllEmployeesWithBalances() {
	try {
		const supabase = await createClient();
		const currentYear = new Date().getFullYear();

		// Get all active employees
		const { data: employees, error: empError } = await supabase
			.from('employees')
			.select('id, full_name, position')
			.eq('is_active', true)
			.order('full_name');

		if (empError) throw empError;

		// Get leave balances for all employees
		const { data: balances, error: balError } = await supabase
			.from('leave_balances')
			.select(`
				*,
				leave_type:leave_types(*)
			`)
			.eq('year', currentYear);

		if (balError) throw balError;

		// Combine data
		const employeesWithBalances = employees?.map((emp) => ({
			...emp,
			balances: balances?.filter((b) => b.employee_id === emp.id) || [],
		}));

		return { data: employeesWithBalances, error: null };
	} catch (error) {
		console.error('getAllEmployeesWithBalances error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch employee balances',
		};
	}
}

/**
 * Assign leave balance to employee
 */
export async function assignLeaveBalance(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const employeeId = formData.get('employee_id') as string;
		const leaveTypeId = formData.get('leave_type_id') as string;
		const totalDays = parseInt(formData.get('total_days') as string);
		const year = parseInt(formData.get('year') as string);

		console.log('=== DEBUG assignLeaveBalance START ===');
		console.log('DEBUG: Form data:', { employeeId, leaveTypeId, totalDays, year });

		if (!employeeId || !leaveTypeId || !totalDays || !year) {
			return {
				status: 'error',
				errors: { _form: ['Missing required fields'] },
			};
		}

		if (totalDays < 1 || totalDays > 365) {
			return {
				status: 'error',
				errors: { _form: ['Total days must be between 1 and 365'] },
			};
		}

		const supabase = await createClient();

		// Check if balance already exists
		const { data: existing, error: checkError } = await supabase
			.from('leave_balances')
			.select('id, used_days')
			.eq('employee_id', employeeId)
			.eq('leave_type_id', leaveTypeId)
			.eq('year', year)
			.single();

		console.log('DEBUG: Check existing result:', { existing, checkError });

		if (existing) {
			// Update existing balance
			console.log('DEBUG: Updating existing balance ID:', existing.id);
			const { error } = await supabase
				.from('leave_balances')
				.update({ total_days: totalDays })
				.eq('id', existing.id);

			if (error) {
				console.error('DEBUG: Update error:', error);
				return {
					status: 'error',
					errors: { _form: [error.message] },
				};
			}
			console.log('DEBUG: Update successful');
		} else {
			// Create new balance
			console.log('DEBUG: Creating new balance');
			const { data: inserted, error } = await supabase
				.from('leave_balances')
				.insert({
					employee_id: employeeId,
					leave_type_id: leaveTypeId,
					year,
					total_days: totalDays,
					used_days: 0,
				})
				.select();

			console.log('DEBUG: Insert result:', { inserted, error });

			if (error) {
				console.error('DEBUG: Insert error:', error);
				return {
					status: 'error',
					errors: { _form: [error.message] },
				};
			}
		}

		console.log('=== DEBUG assignLeaveBalance END ===');

		revalidatePath('/admin/leave-balance');

		return { status: 'success' };
	} catch (error) {
		console.error('assignLeaveBalance error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to assign leave balance'],
			},
		};
	}
}

/**
 * Remove leave balance from employee
 */
export async function removeLeaveBalance(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const balanceId = formData.get('balance_id') as string;

		const supabase = await createClient();

		const { error } = await supabase
			.from('leave_balances')
			.delete()
			.eq('id', balanceId);

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave-balance');

		return { status: 'success' };
	} catch (error) {
		console.error('removeLeaveBalance error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to remove leave balance'],
			},
		};
	}
}
