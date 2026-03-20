'use client';

import FormInput from '@/components/common/form-input';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
	INITIAL_LOGIN_FORM,
	INITIAL_STATE_LOGIN_FORM,
} from '@/constants/auth-constant';
import { LoginForm, loginSchemaForm } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../actions';
import { ArrowRight, Loader2, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CaptchaTurnstile from '@/components/common/captcha-turnstile';
import { TurnstileInstance } from '@marsidev/react-turnstile';

export default function Login() {
	const router = useRouter();
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const captchaRef = useRef<TurnstileInstance>(null);

	const form = useForm<LoginForm>({
		resolver: zodResolver(loginSchemaForm),
		defaultValues: INITIAL_LOGIN_FORM,
	});

	const [loginState, loginAction, isPendingLogin] = useActionState(
		login,
		INITIAL_STATE_LOGIN_FORM
	);

	const onSubmit = form.handleSubmit(async (data) => {
		if (!captchaToken) {
			toast.error('Captcha diperlukan', {
				description: 'Silakan selesaikan verifikasi captcha terlebih dahulu.',
			});
			return;
		}

		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});
		formData.append('captcha_token', captchaToken);

		startTransition(() => {
			loginAction(formData);
		});
	});

	useEffect(() => {
		if (loginState?.status === 'error') {
			const errorMessage = loginState.errors?._form?.[0] || 'Terjadi kesalahan';
			toast.error('Login Gagal', {
				description: errorMessage,
			});
			// Reset captcha on error so the user must solve it again
			setCaptchaToken(null);
			captchaRef.current?.reset();
			startTransition(() => {
				loginAction(null);
			});
		}

		if (loginState?.status === 'success') {
			toast.success('Login Berhasil', {
				description: 'Mengalihkan ke dashboard...',
			});

			// Redirect based on role
			const redirectPath = loginState?.role === 'admin' ? '/admin' : '/employee-dashboard';
			router.push(redirectPath);
			router.refresh();
		}
	}, [loginState, loginAction, router]);

	const fillDemoCredentials = (email: string) => {
		form.setValue('email', email);
		form.setValue('password', 'demo1234');
	};

	return (
		<div className='flex flex-col gap-8 w-full'>
			{/* Header */}
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold tracking-tight'>Sign in</h2>
				<p className='text-muted-foreground text-sm'>
					Enter your credentials to access the dashboard
				</p>
			</div>

			{/* Login Form */}
			<Form {...form}>
				<form onSubmit={onSubmit} className='space-y-5'>
					<FormInput
						form={form}
						name='email'
						label='Email'
						placeholder='you@company.com'
						type='text'
					/>
					<FormInput
						form={form}
						name='password'
						label='Password'
						placeholder='Enter your password'
						type='password'
					/>
					<CaptchaTurnstile
						ref={captchaRef}
						onSuccess={(token) => setCaptchaToken(token)}
						onError={() => setCaptchaToken(null)}
						onExpire={() => setCaptchaToken(null)}
					/>
					<Button
						type='submit'
						className='w-full h-11 mt-2 group'
						disabled={isPendingLogin || !captchaToken}
					>
						{isPendingLogin ? (
							<Loader2 className='animate-spin' />
						) : (
							<>
								Sign in
								<ArrowRight className='ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1' />
							</>
						)}
					</Button>
				</form>
			</Form>

			{/* Divider */}
			<div className='flex items-center gap-3'>
				<div className='h-px flex-1 bg-border' />
				<span className='text-[11px] text-muted-foreground/60 uppercase tracking-[0.15em] font-medium'>Demo access</span>
				<div className='h-px flex-1 bg-border' />
			</div>

			{/* Demo Credentials */}
			<div className='grid gap-3 animate-fade-in-up stagger-2'>
				<button
					type='button'
					onClick={() => fillDemoCredentials('admin@demo.com')}
					className='group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:border-primary/20'
				>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
						<User className='h-4 w-4' />
					</div>
					<div className='flex-1 min-w-0'>
						<div className='text-sm font-semibold'>Admin Account</div>
						<div className='text-xs text-muted-foreground truncate'>admin@demo.com</div>
					</div>
					<ArrowRight className='h-4 w-4 text-muted-foreground/30 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5' />
				</button>

				<button
					type='button'
					onClick={() => fillDemoCredentials('budi@demo.com')}
					className='group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:border-primary/20'
				>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
						<Briefcase className='h-4 w-4' />
					</div>
					<div className='flex-1 min-w-0'>
						<div className='text-sm font-semibold'>Employee Account</div>
						<div className='text-xs text-muted-foreground truncate'>budi@demo.com</div>
					</div>
					<ArrowRight className='h-4 w-4 text-muted-foreground/30 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5' />
				</button>

				<p className='text-center text-[11px] text-muted-foreground/40 mt-1'>
					Password: demo1234
				</p>
			</div>
		</div>
	);
}
