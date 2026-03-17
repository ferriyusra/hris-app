'use client';

import FormInput from '@/components/common/form-input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import {
	INITIAL_LOGIN_FORM,
	INITIAL_STATE_LOGIN_FORM,
} from '@/constants/auth-constant';
import { LoginForm, loginSchemaForm } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Login() {
	const router = useRouter();
	const form = useForm<LoginForm>({
		resolver: zodResolver(loginSchemaForm),
		defaultValues: INITIAL_LOGIN_FORM,
	});

	const [loginState, loginAction, isPendingLogin] = useActionState(
		login,
		INITIAL_STATE_LOGIN_FORM
	);

	const onSubmit = form.handleSubmit(async (data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});

		startTransition(() => {
			loginAction(formData);
		});
	});

	useEffect(() => {
		if (loginState?.status === 'error') {
			const errorMessage = loginState.errors?._form?.[0] || 'An error occurred';
			toast.error('Login Failed', {
				description: errorMessage,
			});
			startTransition(() => {
				loginAction(null);
			});
		}

		if (loginState?.status === 'success') {
			toast.success('Login Successful', {
				description: 'Redirecting to dashboard...',
			});

			// Redirect based on role
			const redirectPath = loginState?.role === 'admin' ? '/admin' : '/employee-dashboard';
			router.push(redirectPath);
			router.refresh();
		}
	}, [loginState, router]);

	const fillDemoCredentials = (email: string) => {
		form.setValue('email', email);
		form.setValue('password', 'demo1234');
	};

	return (
		<div className='flex flex-col gap-4 w-full'>
			<Card>
				<CardHeader className='text-center'>
					<CardTitle className='text-xl'>Welcome</CardTitle>
					<CardDescription>Login to access all features</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={onSubmit} className='space-y-4'>
							<FormInput
								form={form}
								name='email'
								label='Email'
								placeholder='Insert email here'
								type='text'
							/>
							<FormInput
								form={form}
								name='password'
								label='Password'
								placeholder='*******'
								type='password'
							/>
							<Button type='submit'>
								{isPendingLogin ? <Loader2 className='animate-spin' /> : 'Login'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card className='border-dashed'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-sm font-medium'>Demo Accounts</CardTitle>
					<CardDescription className='text-xs'>
						Click to auto-fill credentials (password: demo1234)
					</CardDescription>
				</CardHeader>
				<CardContent className='grid gap-2'>
					<Button
						variant='outline'
						size='sm'
						className='justify-between text-xs'
						onClick={() => fillDemoCredentials('admin@demo.com')}
						type='button'
					>
						<span>Admin</span>
						<span className='text-muted-foreground'>admin@demo.com</span>
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='justify-between text-xs'
						onClick={() => fillDemoCredentials('budi@demo.com')}
						type='button'
					>
						<span>Employee</span>
						<span className='text-muted-foreground'>budi@demo.com</span>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
