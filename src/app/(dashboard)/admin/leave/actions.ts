'use server';

import { createClient } from '@/lib/supabase/server';
import { LeaveRequestFormState } from '@/types/leave';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Get all leave requests (admin)
 */
export async function getAllLeaveRequests() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('leave_requests')
			.select(
				`
				*,
				employee:employees!inner(id, full_name, position),
				leave_type:leave_types(*)
			`
			)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getAllLeaveRequests error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch leave requests',
		};
	}
}

/**
 * Approve leave request
 */
export async function approveLeaveRequest(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		console.log('=== DEBUG approveLeaveRequest START ===');
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
		const id = formData.get('id') as string;

		const { data, error } = await supabase
			.from('leave_requests')
			.update({
				status: 'approved',
				approved_by: profile.id,
				approved_at: new Date().toISOString(),
			})
			.eq('id', id)
			.select();

		if (error) {
			console.error('DEBUG: Update error:', error);
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave');

		return { status: 'success' };
	} catch (error) {
		console.error('approveLeaveRequest error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to approve leave request'],
			},
		};
	}
}

/**
 * Reject leave request
 */
export async function rejectLeaveRequest(
	prevState: LeaveRequestFormState,
	formData: FormData
): Promise<LeaveRequestFormState> {
	try {
		console.log('=== DEBUG rejectLeaveRequest START ===');
		const supabase = await createClient();
		const id = formData.get('id') as string;
		const rejectionReason = formData.get('rejection_reason') as string;

		if (!rejectionReason || rejectionReason.trim().length < 5) {
			return {
				status: 'error',
				errors: { _form: ['Rejection reason must be at least 5 characters'] },
			};
		}

		const { data, error } = await supabase
			.from('leave_requests')
			.update({
				status: 'rejected',
				rejection_reason: rejectionReason,
			})
			.eq('id', id)
			.select();

		if (error) {
			console.error('DEBUG: Update error:', error);
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath('/admin/leave');

		return { status: 'success' };
	} catch (error) {
		console.error('rejectLeaveRequest error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to reject leave request'],
			},
		};
	}
}
