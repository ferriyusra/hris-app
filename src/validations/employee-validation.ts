import z from 'zod';

// Regex for Indonesian phone number format: +62xxx (8-13 digits after +62)
const indonesianPhoneRegex = /^\+62\d{8,13}$/;

export const employeeFormSchema = z.object({
	full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
	position: z.string().min(1, 'Posisi wajib diisi'),
	phone_number: z
		.string()
		.min(1, 'Nomor telepon wajib diisi')
		.regex(
			indonesianPhoneRegex,
			'Nomor telepon harus berformat Indonesia (contoh: +628123456789)'
		),
	is_active: z.string().min(1, 'Status wajib diisi'),
});

export const employeeSchema = z.object({
	full_name: z.string(),
	position: z.string(),
	phone_number: z
		.string()
		.regex(
			indonesianPhoneRegex,
			'Nomor telepon harus berformat Indonesia yang valid'
		),
	is_active: z
		.union([z.boolean(), z.string()])
		.transform((val) => {
			if (typeof val === 'boolean') return val;
			return val === 'true';
		}),
});

export type EmployeeForm = z.infer<typeof employeeFormSchema>;
export type Employee = z.infer<typeof employeeSchema> & { id: string };
