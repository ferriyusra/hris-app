import { z } from 'zod';

export const leaveRequestSchema = z
	.object({
		leave_type_id: z.string().uuid('Jenis cuti tidak valid'),
		start_date: z.string().min(1, 'Tanggal Mulai tidak boleh kosong'),
		end_date: z.string().optional().nullable(),
		reason: z.string().min(5, 'Alasan harus minimal 5 karakter'),
	})
	.refine(
		(data) => {
			// Validate start_date is not in the past
			const start = new Date(data.start_date);
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Reset time to start of day
			start.setHours(0, 0, 0, 0);
			return start >= today;
		},
		{
			message: 'Tanggal Mulai tidak boleh di masa lalu',
			path: ['start_date'],
		}
	)
	.refine(
		(data) => {
			// If end_date is provided, validate it
			if (data.end_date && data.end_date.length > 0) {
				const start = new Date(data.start_date);
				const end = new Date(data.end_date);
				return end >= start;
			}
			return true;
		},
		{
			message: 'Tanggal Akhir harus setelah atau sama dengan Tanggal Mulai',
			path: ['end_date'],
		}
	)
	.refine(
		(data) => {
			// If end_date is provided, validate it's not in the past
			if (data.end_date && data.end_date.length > 0) {
				const end = new Date(data.end_date);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				end.setHours(0, 0, 0, 0);
				return end >= today;
			}
			return true;
		},
		{
			message: 'Tanggal Akhir tidak boleh di masa lalu',
			path: ['end_date'],
		}
	);

export const approveLeaveSchema = z.object({
	id: z.string().uuid(),
});

export const rejectLeaveSchema = z.object({
	id: z.string().uuid(),
	rejection_reason: z.string().min(5, 'Alasan penolakan harus minimal 5 karakter'),
});

export const leaveTypeSchema = z.object({
	name: z.string().min(3, 'Nama harus minimal 3 karakter'),
	description: z.string().optional(),
	max_days_per_year: z.number().min(1, 'Harus minimal 1 hari').max(365, 'Tidak dapat melebihi 365 hari'),
	requires_approval: z.boolean(),
	is_active: z.boolean(),
	allows_flexible_end_date: z.boolean(),
});

export type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;
export type ApproveLeaveForm = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveForm = z.infer<typeof rejectLeaveSchema>;
export type LeaveTypeForm = z.infer<typeof leaveTypeSchema>;
