import { z } from 'zod';

export const salaryConfigFormSchema = z.object({
	employee_id: z.string().min(1, 'Karyawan wajib dipilih'),
	year: z.string().min(1, 'Tahun wajib dipilih'),
	base_salary: z.string().min(1, 'Gaji pokok wajib diisi'),
	transport_allowance: z.string(),
	meal_allowance: z.string(),
	late_deduction_per_day: z.string(),
	absent_deduction_per_day: z.string(),
	half_day_deduction_per_day: z.string(),
	overtime_rate_per_hour: z.string(),
});

export const salaryConfigSchema = z.object({
	employee_id: z.string().uuid('Karyawan tidak valid'),
	year: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(2020, 'Tahun tidak valid')),
	base_salary: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Gaji pokok tidak boleh negatif')),
	transport_allowance: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Tunjangan transport tidak boleh negatif'))
		.optional()
		.default(0),
	meal_allowance: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Tunjangan makan tidak boleh negatif'))
		.optional()
		.default(0),
	late_deduction_per_day: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Potongan terlambat tidak boleh negatif'))
		.optional()
		.default(0),
	absent_deduction_per_day: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Potongan absen tidak boleh negatif'))
		.optional()
		.default(0),
	half_day_deduction_per_day: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Potongan setengah hari tidak boleh negatif'))
		.optional()
		.default(0),
	overtime_rate_per_hour: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Tarif lembur tidak boleh negatif'))
		.optional()
		.default(0),
});

export type SalaryConfigForm = z.infer<typeof salaryConfigFormSchema>;
