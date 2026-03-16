import { z } from 'zod';

export const payrollFormSchema = z.object({
	month: z.string().min(1, 'Bulan wajib dipilih'),
	year: z.string().min(1, 'Tahun wajib dipilih'),
});

export const payrollSchema = z.object({
	month: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(1, 'Bulan tidak valid').max(12, 'Bulan tidak valid')),
	year: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(2020, 'Tahun tidak valid')),
});

export type PayrollForm = z.infer<typeof payrollFormSchema>;
