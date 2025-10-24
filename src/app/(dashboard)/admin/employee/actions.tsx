'use server';

import { createClient } from '@/lib/supabase/server';
import { EmployeeFormState } from '@/types/employee';
import { employeeSchema } from '@/validations/employee-validation';

export async function createEmployee(
	prevState: EmployeeFormState,
	formData: FormData
) {
	const validatedFields = employeeSchema.safeParse({
		full_name: formData.get('full_name'),
		position: formData.get('position'),
		phone_number: formData.get('phone_number'),
		is_active: formData.get('is_active'),
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

	const { error } = await supabase.from('employees').insert({
		full_name: validatedFields.data.full_name,
		position: validatedFields.data.position,
		phone_number: validatedFields.data.phone_number,
		is_active: validatedFields.data.is_active,
		// user_id will be null by default, and will be set when creating a user
	});

	if (error) {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [error.message],
			},
		};
	}

	return {
		status: 'success',
	};
}

export async function updateEmployee(
	prevState: EmployeeFormState,
	formData: FormData
) {
	const validatedFields = employeeSchema.safeParse({
		full_name: formData.get('full_name'),
		position: formData.get('position'),
		phone_number: formData.get('phone_number'),
		is_active: formData.get('is_active'),
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
		.from('employees')
		.update({
			full_name: validatedFields.data.full_name,
			position: validatedFields.data.position,
			phone_number: validatedFields.data.phone_number,
			is_active: validatedFields.data.is_active,
		})
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

	return {
		status: 'success',
	};
}

export async function deleteEmployee(
	prevState: EmployeeFormState,
	formData: FormData
) {
	const supabase = await createClient();

	const { error } = await supabase
		.from('employees')
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

	return { status: 'success' };
}

export async function getAvailableEmployees() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('employees')
		.select('id, full_name, position')
		.is('user_id', null)
		.eq('is_active', true)
		.order('full_name');

	if (error) {
		return { data: null, error: error.message };
	}

	return { data, error: null };
}
