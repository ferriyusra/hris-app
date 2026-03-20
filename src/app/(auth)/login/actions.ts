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

	// Validate form fields first (avoids unnecessary CAPTCHA API call on invalid data)
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

	// Verify CAPTCHA token
	const captchaToken = formData.get('captcha_token') as string | null;

	if (!captchaToken) {
		return {
			status: 'error',
			role: '',
			errors: {
				_form: ['Verifikasi captcha diperlukan. Silakan selesaikan captcha terlebih dahulu.'],
			},
		};
	}

	try {
		const captchaVerification = await fetch(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					secret: process.env.TURNSTILE_SECRET_KEY || '',
					response: captchaToken,
				}),
				signal: AbortSignal.timeout(5000),
			}
		);

		if (!captchaVerification.ok) {
			throw new Error(`HTTP ${captchaVerification.status}`);
		}

		const captchaResult = (await captchaVerification.json()) as { success: boolean };

		if (!captchaResult.success) {
			return {
				status: 'error',
				role: '',
				errors: {
					_form: ['Verifikasi captcha gagal. Silakan coba lagi.'],
				},
			};
		}
	} catch {
		return {
			status: 'error',
			role: '',
			errors: {
				_form: ['Verifikasi captcha gagal. Silakan coba lagi nanti.'],
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
			maxAge: 60 * 15, // 15 minutes
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
