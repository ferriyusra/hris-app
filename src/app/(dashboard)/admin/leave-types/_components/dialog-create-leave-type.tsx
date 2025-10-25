'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeaveTypeForm, leaveTypeSchema } from '@/validations/leave-validation';
import { createLeaveType } from '../actions';
import FormInput from '@/components/common/form-input';
import FormTextarea from '@/components/common/form-textarea';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface DialogCreateLeaveTypeProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DialogCreateLeaveType({
	open,
	onOpenChange,
}: DialogCreateLeaveTypeProps) {
	const form = useForm<LeaveTypeForm>({
		resolver: zodResolver(leaveTypeSchema),
		defaultValues: {
			name: '',
			description: '',
			max_days_per_year: 12,
			requires_approval: true,
			is_active: true,
		},
	});

	const [state, formAction, isPending] = useActionState(createLeaveType, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, String(value));
		});

		hasShownToastRef.current = false;

		startTransition(() => {
			formAction(formData);
		});
	});

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state.status === 'error') {
			if (state.errors) {
				Object.entries(state.errors).forEach(([key, value]) => {
					if (key !== '_form' && value && value.length > 0) {
						form.setError(key as keyof LeaveTypeForm, {
							message: value[0],
						});
					}
				});
			}

			toast.error('Create Leave Type Failed', {
				description: state.errors?._form?.[0] || 'Please check the form',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Leave Type Created Successfully');
			form.reset();
			onOpenChange(false);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [state, form, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Create Leave Type</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className='space-y-4'>
						<FormInput
							form={form}
							name='name'
							label='Name'
							placeholder='e.g., Annual Leave, Sick Leave'
						/>

						<FormTextarea
							form={form}
							name='description'
							label='Description (Optional)'
							placeholder='Brief description of this leave type...'
							rows={3}
						/>

						<FormInput
							form={form}
							name='max_days_per_year'
							label='Maximum Days Per Year'
							type='number'
							placeholder='12'
						/>

						<FormField
							control={form.control}
							name='requires_approval'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Requires Approval</FormLabel>
										<p className='text-sm text-muted-foreground'>
											Check this if leave requests of this type need admin approval
										</p>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='is_active'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Active</FormLabel>
										<p className='text-sm text-muted-foreground'>
											Only active leave types can be selected by employees
										</p>
									</div>
								</FormItem>
							)}
						/>

						<div className='flex justify-end gap-2 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => onOpenChange(false)}
								disabled={isPending}>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending}>
								{isPending ? 'Creating...' : 'Create Leave Type'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
