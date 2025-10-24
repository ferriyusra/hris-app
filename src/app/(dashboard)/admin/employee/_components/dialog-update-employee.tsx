import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateEmployee } from '../actions';
import { toast } from 'sonner';
import FormEmployee from './form-employee';
import { Dialog } from '@radix-ui/react-dialog';
import {
	Employee,
	EmployeeForm,
	employeeFormSchema,
} from '@/validations/employee-validation';
import { INITIAL_STATE_EMPLOYEE } from '@/constants/employee-constant';

export default function DialogUpdateEmployee({
	refetch,
	currentData,
	open,
	handleChangeAction,
}: {
	refetch: () => void;
	currentData?: Employee;
	open?: boolean;
	handleChangeAction?: (open: boolean) => void;
}) {
	const form = useForm<EmployeeForm>({
		resolver: zodResolver(employeeFormSchema),
	});

	const [updateEmployeeState, updateEmployeeAction, isPendingupdateEmployee] =
		useActionState(updateEmployee, INITIAL_STATE_EMPLOYEE);

	const onSubmit = form.handleSubmit((data) => {
		if (!currentData?.id) {
			toast.error('Invalid employee data');
			return;
		}

		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});
		formData.append('id', currentData.id);

		startTransition(() => {
			updateEmployeeAction(formData);
		});
	});

	useEffect(() => {
		if (updateEmployeeState?.status === 'error') {
			// Set field-specific errors
			if (updateEmployeeState.errors) {
				Object.entries(updateEmployeeState.errors).forEach(([key, value]) => {
					if (key !== '_form' && value && value.length > 0) {
						form.setError(key as keyof EmployeeForm, {
							message: value[0],
						});
					}
				});
			}

			// Show toast for general error
			toast.error('Update Employee Failed', {
				description: updateEmployeeState.errors?._form?.[0] || 'Please check the form',
			});
		}

		if (updateEmployeeState?.status === 'success') {
			toast.success('Update Employee Success');
			form.reset();
			handleChangeAction?.(false);
			refetch();
		}
	}, [updateEmployeeState, form, handleChangeAction, refetch]);

	useEffect(() => {
		if (currentData) {
			form.setValue('full_name', currentData.full_name || '');
			form.setValue('position', currentData.position || '');
			form.setValue('phone_number', currentData.phone_number || '');
			form.setValue(
				'is_active',
				currentData.is_active !== undefined
					? String(currentData.is_active)
					: ''
			);
		} else {
			// Reset form when dialog closes (currentData becomes undefined)
			form.reset();
		}
	}, [currentData, form]);

	return (
		<Dialog open={open} onOpenChange={handleChangeAction}>
			<FormEmployee
				form={form}
				onSubmit={onSubmit}
				isLoading={isPendingupdateEmployee}
				type='Update'
			/>
		</Dialog>
	);
}
