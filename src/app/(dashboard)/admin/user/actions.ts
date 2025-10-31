'use server';

import { deleteFile, uploadFile } from '@/actions/storage-action';
import { createClient } from '@/lib/supabase/server';
import { AuthFormState } from '@/types/auth';
import {
	createUserSchema,
	updateUserSchema,
} from '@/validations/auth-validation';

export async function createUser(prevState: AuthFormState, formData: FormData) {
	let validatedFields = createUserSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
		name: formData.get('name'),
		role: formData.get('role'),
		avatar_url: formData.get('avatar_url'),
		employee_id: formData.get('employee_id') || undefined,
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

	if (validatedFields.data.avatar_url instanceof File) {
		const { errors, data } = await uploadFile(
			'images',
			'users',
			validatedFields.data.avatar_url
		);
		if (errors) {
			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: [...errors._form],
				},
			};
		}

		validatedFields = {
			...validatedFields,
			data: {
				...validatedFields.data,
				avatar_url: data.url,
			},
		};
	}

	// Use admin client for user creation and employee linking
	const supabase = await createClient({ isAdmin: true });

	const { data: userData, error } = await supabase.auth.admin.createUser({
		email: validatedFields.data.email,
		password: validatedFields.data.password,
		email_confirm: true, // Auto-confirm email for admin-created users
		user_metadata: {
			name: validatedFields.data.name,
			role: validatedFields.data.role,
			avatar_url: validatedFields.data.avatar_url,
		},
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

	// Link user to employee if employee_id is provided
	if (validatedFields.data.employee_id && userData.user) {
		const { error: updateError } = await supabase
			.from('employees')
			.update({ user_id: userData.user.id })
			.eq('id', validatedFields.data.employee_id);

		if (updateError) {
			// Rollback: delete the created user if employee linking fails
			await supabase.auth.admin.deleteUser(userData.user.id);

			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: [
						`Failed to link user to employee: ${updateError.message}`,
					],
				},
			};
		}
	}

	return {
		status: 'success',
	};
}

export async function updateUser(prevState: AuthFormState, formData: FormData) {
	let validatedFields = updateUserSchema.safeParse({
		name: formData.get('name'),
		role: formData.get('role'),
		avatar_url: formData.get('avatar_url'),
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

	if (validatedFields.data.avatar_url instanceof File) {
		const oldAvatarUrl = formData.get('old_avatar_url') as string;
		const { errors, data } = await uploadFile(
			'images',
			'users',
			validatedFields.data.avatar_url,
			oldAvatarUrl.split('/images/')[1]
		);
		if (errors) {
			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: [...errors._form],
				},
			};
		}

		validatedFields = {
			...validatedFields,
			data: {
				...validatedFields.data,
				avatar_url: data.url,
			},
		};
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from('profiles')
		.update({
			name: validatedFields.data.name,
			role: validatedFields.data.role,
			avatar_url: validatedFields.data.avatar_url,
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

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
	const supabase = await createClient({ isAdmin: true });
	const image = formData.get('avatar_url') as string;
	const { status, errors } = await deleteFile(
		'images',
		image.split('/images/')[1]
	);

	if (status === 'error') {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [errors?._form?.[0] ?? 'Unknown error'],
			},
		};
	}

	const { error } = await supabase.auth.admin.deleteUser(
		formData.get('id') as string
	);

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
