'use server';

import { uploadFile } from '@/actions/storage-action';
import { createClient } from '@/lib/supabase/server';
import { ProfileFormState } from '@/types/employee-profile';
import { employeeProfileSchema } from '@/validations/employee-profile-validation';
import { revalidatePath } from 'next/cache';

export async function getMyProfile() {
	try {
		const supabase = await createClient();

		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return {
				profile: null,
				employee: null,
				email: null,
				error: 'Not authenticated',
			};
		}

		// Get profile
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (profileError) {
			return {
				profile: null,
				employee: null,
				email: user.email,
				error: profileError.message,
			};
		}

		// Get employee data
		const { data: employee, error: employeeError } = await supabase
			.from('employees')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (employeeError) {
			return {
				profile,
				employee: null,
				email: user.email,
				error: employeeError.message,
			};
		}

		return {
			profile,
			employee,
			email: user.email,
			error: null,
		};
	} catch (error) {
		return {
			profile: null,
			employee: null,
			email: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

export async function updateMyProfile(
	prevState: ProfileFormState,
	formData: FormData
): Promise<ProfileFormState> {
	try {
		const avatarFile = formData.get('avatar_url');
		let avatarUrl: string | null | undefined = undefined;

		// Handle avatar upload if it's a file
		if (avatarFile instanceof File && avatarFile.size > 0) {
			const oldAvatarUrl = formData.get('old_avatar_url') as string;
			const oldAvatarPath = oldAvatarUrl?.split('/images/')[1];

			const { errors, data } = await uploadFile(
				'images',
				'users',
				avatarFile,
				oldAvatarPath || undefined
			);

			if (errors) {
				return {
					status: 'error',
					errors: {
						...prevState.errors,
						_form: [...(errors._form || [])],
					},
				};
			}

			avatarUrl = data.url;
		} else if (typeof avatarFile === 'string') {
			// If it's already a string URL, use it
			avatarUrl = avatarFile;
		}

		// Validate fields (now avatar_url is a string or undefined)
		const validatedFields = employeeProfileSchema.safeParse({
			name: formData.get('name'),
			phone_number: formData.get('phone_number'),
			avatar_url: avatarUrl,
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

		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: ['Not authenticated'],
				},
			};
		}

		// Update profiles table
		const { error: profileError } = await supabase
			.from('profiles')
			.update({
				name: validatedFields.data.name,
				avatar_url: validatedFields.data.avatar_url,
			})
			.eq('id', user.id);

		if (profileError) {
			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: [profileError.message],
				},
			};
		}

		// Update employees table
		const { error: employeeError } = await supabase
			.from('employees')
			.update({
				full_name: validatedFields.data.name,
				phone_number: validatedFields.data.phone_number,
			})
			.eq('user_id', user.id);

		if (employeeError) {
			return {
				status: 'error',
				errors: {
					...prevState.errors,
					_form: [employeeError.message],
				},
			};
		}

		revalidatePath('/employee-profile');

		return {
			status: 'success',
			errors: {},
		};
	} catch (error) {
		return {
			status: 'error',
			errors: {
				...prevState.errors,
				_form: [error instanceof Error ? error.message : 'Unknown error occurred'],
			},
		};
	}
}
