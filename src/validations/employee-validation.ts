import z from 'zod';

export const employeeFormSchema = z.object({
	full_name: z.string().min(1, 'Full Name is required'),
	position: z.string().min(1, 'Position is required'),
	phone_number: z.string().min(1, 'Phone Number is required'),
	is_active: z.string().min(1, 'Status is required'),
});

export const employeeSchema = z.object({
	full_name: z.string(),
	position: z.string(),
	phone_number: z.string(),
	is_active: z
		.union([z.boolean(), z.string()])
		.transform((val) => {
			if (typeof val === 'boolean') return val;
			return val === 'true';
		}),
});

export type EmployeeForm = z.infer<typeof employeeFormSchema>;
export type Employee = z.infer<typeof employeeSchema> & { id: string };
