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
	max_days_per_year: z.coerce.number().min(1, 'Harus minimal 1 hari').max(365, 'Tidak dapat melebihi 365 hari'),
	requires_approval: z.boolean().default(true),
	is_active: z.boolean().default(true),
	allows_flexible_end_date: z.boolean().default(false),
});

export type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;
export type ApproveLeaveForm = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveForm = z.infer<typeof rejectLeaveSchema>;
export type LeaveTypeForm = z.infer<typeof leaveTypeSchema>;
