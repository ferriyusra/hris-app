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
		user_id: '3f2fd94f-a770-481d-add6-bdc2ce466312',
		position: validatedFields.data.position,
		phone_number: validatedFields.data.phone_number,
		is_active: validatedFields.data.is_active,
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
