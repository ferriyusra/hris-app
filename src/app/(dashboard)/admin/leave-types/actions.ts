'use server';

import { createClient } from '@/lib/supabase/server';
import { LeaveRequestFormState } from '@/types/leave';
import { leaveTypeSchema } from '@/validations/leave-validation';
import { revalidatePath } from 'next/cache';

/**
 * Get all leave types
 */
export async function getAllLeaveTypes() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('leave_types')
			.select('*')
			.order('name');

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getAllLeaveTypes error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch leave types',
		};
	}
}

/**
 * Create leave type
 */
export async function createLeaveType(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const validatedFields = leaveTypeSchema.safeParse({
			name: formData.get('name'),
			description: formData.get('description') || undefined,
			max_days_per_year: formData.get('max_days_per_year'),
			requires_approval: formData.get('requires_approval') === 'true',
			is_active: formData.get('is_active') === 'true',
			allows_flexible_end_date: formData.get('allows_flexible_end_date') === 'true',
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

		const supabase = await createClient();

		const { error } = await supabase.from('leave_types').insert({
			name: validatedFields.data.name,
			description: validatedFields.data.description || null,
			max_days_per_year: validatedFields.data.max_days_per_year,
			requires_approval: validatedFields.data.requires_approval,
			is_active: validatedFields.data.is_active,
			allows_flexible_end_date: validatedFields.data.allows_flexible_end_date,
		});

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave-types');

		return { status: 'success' };
	} catch (error) {
		console.error('createLeaveType error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to create leave type'],
			},
		};
	}
}

/**
 * Update leave type
 */
export async function updateLeaveType(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const id = formData.get('id') as string;

		const validatedFields = leaveTypeSchema.safeParse({
			name: formData.get('name'),
			description: formData.get('description') || undefined,
			max_days_per_year: formData.get('max_days_per_year'),
			requires_approval: formData.get('requires_approval') === 'true',
			is_active: formData.get('is_active') === 'true',
			allows_flexible_end_date: formData.get('allows_flexible_end_date') === 'true',
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

		const supabase = await createClient();

		const { error } = await supabase
			.from('leave_types')
			.update({
				name: validatedFields.data.name,
				description: validatedFields.data.description || null,
				max_days_per_year: validatedFields.data.max_days_per_year,
				requires_approval: validatedFields.data.requires_approval,
				is_active: validatedFields.data.is_active,
				allows_flexible_end_date: validatedFields.data.allows_flexible_end_date,
			})
			.eq('id', id);

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave-types');

		return { status: 'success' };
	} catch (error) {
		console.error('updateLeaveType error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to update leave type'],
			},
		};
	}
}

/**
 * Delete leave type
 */
export async function deleteLeaveType(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		const supabase = await createClient();
		const id = formData.get('id') as string;

		const { error } = await supabase.from('leave_types').delete().eq('id', id);

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave-types');

		return { status: 'success' };
	} catch (error) {
		console.error('deleteLeaveType error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to delete leave type'],
			},
		};
	}
}
