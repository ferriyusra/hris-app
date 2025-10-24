import z from 'zod';

// Regex for Indonesian phone number format: +62xxx (8-13 digits after +62)
const indonesianPhoneRegex = /^\+62\d{8,13}$/;

export const employeeFormSchema = z.object({
	full_name: z.string().min(1, 'Full Name is required'),
	position: z.string().min(1, 'Position is required'),
	phone_number: z
		.string()
		.min(1, 'Phone Number is required')
		.regex(
			indonesianPhoneRegex,
			'Phone number must be a valid Indonesian number (e.g., +628123456789)'
		),
	is_active: z.string().min(1, 'Status is required'),
});

export const employeeSchema = z.object({
	full_name: z.string(),
	position: z.string(),
	phone_number: z
		.string()
		.regex(
			indonesianPhoneRegex,
			'Phone number must be a valid Indonesian number'
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
