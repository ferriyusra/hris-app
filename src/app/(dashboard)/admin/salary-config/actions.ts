'use server';

import { createClient } from '@/lib/supabase/server';
import { SalaryConfigFormState } from '@/types/payroll';
import { salaryConfigSchema } from '@/validations/salary-config-validation';
import { revalidatePath } from 'next/cache';

export async function getAllSalaryConfigs() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('salary_configs')
			.select(
				`
				*,
				employee:employees!inner(id, full_name, position)
			`
			)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getAllSalaryConfigs error:', error);
		return {
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'Gagal mengambil data konfigurasi gaji',
		};
	}
}

export async function createSalaryConfig(
	prevState: SalaryConfigFormState,
	formData: FormData
): Promise<SalaryConfigFormState> {
	const validatedFields = salaryConfigSchema.safeParse({
		employee_id: formData.get('employee_id'),
		base_salary: formData.get('base_salary'),
		transport_allowance: formData.get('transport_allowance'),
		meal_allowance: formData.get('meal_allowance'),
		late_deduction_per_day: formData.get('late_deduction_per_day'),
		absent_deduction_per_day: formData.get('absent_deduction_per_day'),
		half_day_deduction_per_day: formData.get('half_day_deduction_per_day'),
		overtime_rate_per_hour: formData.get('overtime_rate_per_hour'),
		year: formData.get('year'),
	});

	if (!validatedFields.success) {
		return {
			status: 'error',
			errors: {
				...validatedFields.error.flatten().fieldErrors,
				_form: [],
			},
		};
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from('salary_configs')
		.insert(validatedFields.data);

	if (error) {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [error.message],
			},
		};
	}

	revalidatePath('/admin/salary-config');

	return { status: 'success' };
}

export async function updateSalaryConfig(
	prevState: SalaryConfigFormState,
	formData: FormData
): Promise<SalaryConfigFormState> {
	const validatedFields = salaryConfigSchema.safeParse({
		employee_id: formData.get('employee_id'),
		base_salary: formData.get('base_salary'),
		transport_allowance: formData.get('transport_allowance'),
		meal_allowance: formData.get('meal_allowance'),
		late_deduction_per_day: formData.get('late_deduction_per_day'),
		absent_deduction_per_day: formData.get('absent_deduction_per_day'),
		half_day_deduction_per_day: formData.get('half_day_deduction_per_day'),
		overtime_rate_per_hour: formData.get('overtime_rate_per_hour'),
		year: formData.get('year'),
	});

	if (!validatedFields.success) {
		return {
			status: 'error',
			errors: {
				...validatedFields.error.flatten().fieldErrors,
				_form: [],
			},
		};
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from('salary_configs')
		.update(validatedFields.data)
		.eq('id', formData.get('id'));

	if (error) {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [error.message],
			},
		};
	}

	revalidatePath('/admin/salary-config');

	return { status: 'success' };
}

export async function deleteSalaryConfig(
	prevState: SalaryConfigFormState,
	formData: FormData
): Promise<SalaryConfigFormState> {
	const supabase = await createClient();

	const { error } = await supabase
		.from('salary_configs')
		.delete()
		.eq('id', formData.get('id'));

	if (error) {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [error.message],
			},
		};
	}

	revalidatePath('/admin/salary-config');

	return { status: 'success' };
}

export async function getEmployeesWithoutSalaryConfig(year: number) {
	const supabase = await createClient();

	const { data: existingConfigs } = await supabase
		.from('salary_configs')
		.select('employee_id')
		.eq('year', year);

	const existingIds = (existingConfigs || []).map((c) => c.employee_id);

	let query = supabase
		.from('employees')
		.select('id, full_name, position')
		.eq('is_active', true)
		.order('full_name');

	if (existingIds.length > 0) {
		query = query.not('id', 'in', `(${existingIds.join(',')})`);
	}

	const { data, error } = await query;

	if (error) {
		return { data: null, error: error.message };
	}

	return { data, error: null };
}
