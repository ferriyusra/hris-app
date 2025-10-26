import { z } from 'zod';

export const leaveRequestSchema = z
	.object({
		leave_type_id: z.string().uuid('Invalid leave type'),
		start_date: z.string().min(1, 'Tanggal Mulai tidak boleh kosong'),
		end_date: z.string().min(1, 'Tanggal Akhir tidak boleh kosong'),
		reason: z.string().min(10, 'Reason must be at least 10 characters'),
	})
	.refine(
		(data) => {
			const start = new Date(data.start_date);
			const end = new Date(data.end_date);
			return end >= start;
		},
		{
			message: 'Tanggal Akhir must be after or equal to Tanggal Mulai',
			path: ['end_date'],
		}
	);

export const approveLeaveSchema = z.object({
	id: z.string().uuid(),
});

export const rejectLeaveSchema = z.object({
	id: z.string().uuid(),
	rejection_reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
});

export const leaveTypeSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	description: z.string().optional(),
	max_days_per_year: z.coerce.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days'),
	requires_approval: z.boolean().default(true),
	is_active: z.boolean().default(true),
});

export type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;
export type ApproveLeaveForm = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveForm = z.infer<typeof rejectLeaveSchema>;
export type LeaveTypeForm = z.infer<typeof leaveTypeSchema>;
