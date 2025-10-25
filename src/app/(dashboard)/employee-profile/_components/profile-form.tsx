'use client';

import FormImage from '@/components/common/form-image';
import FormInput from '@/components/common/form-input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Preview } from '@/types/general';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Calendar, Briefcase, IdCard, Shield } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateMyProfile } from '../actions';
import {
	employeeProfileFormSchema,
	EmployeeProfileForm,
} from '@/validations/employee-profile-validation';
import { ProfileFormState } from '@/types/employee-profile';

interface ProfileFormProps {
	initialData: {
		id: string;
		name: string;
		email: string;
		role: string;
		avatar_url: string | null;
		employee_id: string;
		position: string;
		join_date: string;
		phone_number: string;
	};
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [preview, setPreview] = useState<Preview>({
		file: null,
		displayUrl: initialData.avatar_url || '',
	});

	const form = useForm<EmployeeProfileForm>({
		resolver: zodResolver(employeeProfileFormSchema),
		defaultValues: {
			name: initialData.name,
			phone_number: initialData.phone_number,
			avatar_url: initialData.avatar_url,
		},
	});

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			formData.set('old_avatar_url', initialData.avatar_url || '');

			const initialState: ProfileFormState = {
				status: 'idle',
				errors: {},
			};

			const result = await updateMyProfile(initialState, formData);

			if (result.status === 'success') {
				toast.success('Profile updated successfully', {
					description: 'Your profile information has been updated.',
				});

				// Reset preview to new avatar
				if (preview.file) {
					setPreview({
						file: null,
						displayUrl: preview.displayUrl,
					});
				}

				// Reload page to refresh data everywhere (sidebar, profile, etc)
				window.location.reload();
			} else {
				if (result.errors?._form) {
					toast.error('Failed to update profile', {
						description: result.errors._form[0],
					});
				} else {
					toast.error('Failed to update profile', {
						description: 'Please check the form for errors.',
					});
				}

				// Set field errors
				if (result.errors?.name) {
					form.setError('name', { message: result.errors.name[0] });
				}
				if (result.errors?.phone_number) {
					form.setError('phone_number', {
						message: result.errors.phone_number[0],
					});
				}
				if (result.errors?.avatar_url) {
					form.setError('avatar_url', {
						message: result.errors.avatar_url[0],
					});
				}
			}
		} catch (error) {
			toast.error('Failed to update profile', {
				description: 'An unexpected error occurred.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	useEffect(() => {
		// Update preview when initialData changes
		if (initialData.avatar_url) {
			setPreview({
				file: null,
				displayUrl: initialData.avatar_url,
			});
		}
	}, [initialData.avatar_url]);

	return (
		<div className='w-full max-w-4xl mx-auto space-y-6'>
			<div>
				<h1 className='text-2xl font-bold'>Update Data Diri</h1>
				<p className='text-muted-foreground'>
					Update your personal information
				</p>
			</div>

			{/* Read-Only Information Card */}
			<Card>
				<CardHeader>
					<CardTitle>Employee Information</CardTitle>
					<CardDescription>
						Your employment information (read-only)
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Profile Header with Avatar */}
					<div className='flex flex-col sm:flex-row items-center gap-6 pb-6 border-b mb-6'>
						<Avatar className='h-24 w-24 border-4 border-primary/10'>
							<AvatarImage src={initialData.avatar_url || ''} alt={initialData.name} />
							<AvatarFallback className='text-2xl font-semibold bg-primary/10'>
								{initialData.name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex-1 text-center sm:text-left'>
							<h3 className='text-2xl font-bold'>{initialData.name}</h3>
							<p className='text-muted-foreground text-lg'>{initialData.position}</p>
							<div className='flex gap-2 mt-2 justify-center sm:justify-start'>
								<Badge variant='secondary' className='capitalize'>
									<Shield className='h-3 w-3 mr-1' />
									{initialData.role}
								</Badge>
							</div>
						</div>
					</div>

					{/* Employee Details Grid */}
					<div className='grid gap-6 sm:grid-cols-2'>
						<div className='space-y-2'>
							<Label className='text-muted-foreground flex items-center gap-2'>
								<IdCard className='h-4 w-4' />
								Employee ID
							</Label>
							<div className='px-3 py-2 bg-muted rounded-md font-mono text-sm'>
								{initialData.employee_id}
							</div>
						</div>

						<div className='space-y-2'>
							<Label className='text-muted-foreground flex items-center gap-2'>
								<Mail className='h-4 w-4' />
								Email
							</Label>
							<div className='px-3 py-2 bg-muted rounded-md text-sm'>
								{initialData.email}
							</div>
						</div>

						<div className='space-y-2'>
							<Label className='text-muted-foreground flex items-center gap-2'>
								<Briefcase className='h-4 w-4' />
								Position
							</Label>
							<div className='px-3 py-2 bg-muted rounded-md font-medium text-sm'>
								{initialData.position}
							</div>
						</div>

						<div className='space-y-2'>
							<Label className='text-muted-foreground flex items-center gap-2'>
								<Calendar className='h-4 w-4' />
								Join Date
							</Label>
							<div className='px-3 py-2 bg-muted rounded-md text-sm'>
								{formatDate(initialData.join_date)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Editable Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle>Update Your Profile</CardTitle>
					<CardDescription>
						Make changes to your personal information and contact details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={onSubmit} className='space-y-6'>
							<div className='space-y-4'>
								<FormImage
									form={form}
									name='avatar_url'
									label='Profile Photo'
									preview={preview}
									setPreview={setPreview}
								/>

								<div className='pt-2 border-t'>
									<h4 className='text-sm font-semibold mb-4'>Personal Information</h4>
									<div className='space-y-4'>
										<FormInput
											form={form}
											name='name'
											label='Full Name'
											placeholder='Enter your full name'
										/>
										<FormInput
											form={form}
											name='phone_number'
											label='Phone Number'
											placeholder='+628123456789'
											type='tel'
										/>
									</div>
								</div>
							</div>

							<div className='flex justify-end gap-3 pt-4 border-t'>
								<Button
									type='button'
									variant='outline'
									disabled={isLoading}
									onClick={() => form.reset()}
								>
									Reset
								</Button>
								<Button
									type='submit'
									disabled={isLoading}
									className='cursor-pointer'
								>
									{isLoading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving Changes...
										</>
									) : (
										'Save Changes'
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
