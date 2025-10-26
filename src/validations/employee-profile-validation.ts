import z from 'zod';

// Regex for Indonesian phone number format: +62xxx (8-13 digits after +62)
const indonesianPhoneRegex = /^\+62\d{8,13}$/;

export const employeeProfileFormSchema = z.object({
	name: z.string().min(1, 'Nama tidak boleh kosong'),
	phone_number: z
		.string()
		.min(1, 'Nomor Telepon tidak boleh kosong')
		.regex(
			indonesianPhoneRegex,
			'Phone number must be a valid Indonesian number (e.g., +628123456789)'
		),
	avatar_url: z.any().optional().nullable(),
});

export const employeeProfileSchema = z.object({
	name: z.string().min(1, 'Nama tidak boleh kosong'),
	phone_number: z
		.string()
		.min(1, 'Nomor Telepon tidak boleh kosong')
		.regex(
			indonesianPhoneRegex,
			'Nomor telepon harus berupa nomor Indonesia yang valid'
		),
	avatar_url: z.string().optional().nullable(),
});

export type EmployeeProfileForm = z.infer<typeof employeeProfileFormSchema>;
export type EmployeeProfileData = z.infer<typeof employeeProfileSchema>;
