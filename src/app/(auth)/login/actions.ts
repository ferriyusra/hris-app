'use server';

import { createClient } from '@/lib/supabase/server';
import { AuthFormState } from '@/types/auth';
import { loginSchemaForm } from '@/validations/auth-validation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { INITIAL_STATE_LOGIN_FORM } from '@/constants/auth-constant';

export async function login(
	prevState: AuthFormState,
	formData: FormData | null
) {
	if (!formData) {
		return INITIAL_STATE_LOGIN_FORM;
	}

	const validatedFields = loginSchemaForm.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	});

	if (!validatedFields.success) {
		return {
			status: 'error',
			role: '',
			errors: {
				...validatedFields.error.flatten().fieldErrors,
				_form: [],
			},
		};
	}

	const supabase = await createClient();

	const {
		error,
		data: { user },
	} = await supabase.auth.signInWithPassword(validatedFields.data);

	if (error) {
		return {
			status: 'error',
			role: '',
			errors: {
				...prevState.errors,
				_form: [error.message],
			},
		};
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user?.id)
		.single();

	if (profile) {
		const cookiesStore = await cookies();
		cookiesStore.set('user_profile', JSON.stringify(profile), {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
	}

	revalidatePath('/', 'layout');

	// Return success with role for client-side redirect
	return {
		status: 'success',
		errors: {
			email: [],
			password: [],
			_form: [],
		},
		role: profile?.role || 'employee',
	};
}
