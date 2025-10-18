import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateEmployee } from '../actions';
import { toast } from 'sonner';
import FormEmployee from './form-employee';
import { Dialog } from '@radix-ui/react-dialog';
import {
	Table,
	TableForm,
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
	currentData?: Table;
	open?: boolean;
	handleChangeAction?: (open: boolean) => void;
}) {
	const form = useForm<TableForm>({
		resolver: zodResolver(employeeFormSchema),
	});

	const [updateEmployeeState, updateEmployeeAction, isPendingupdateEmployee] =
		useActionState(updateEmployee, INITIAL_STATE_EMPLOYEE);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([Key, value]) => {
			formData.append(Key, value);
		});
		formData.append('id', currentData?.id ?? '');

		startTransition(() => {
			updateEmployeeAction(formData);
		});
	});

	useEffect(() => {
		if (updateEmployeeState?.status === 'error') {
			toast.error('Update Table Failed', {
				description: updateEmployeeState.errors?._form?.[0],
			});
		}

		if (updateEmployeeState?.status === 'success') {
			toast.success('Update Table Success');
			form.reset();
			handleChangeAction?.(false);
			refetch();
		}
	}, [updateEmployeeState]);

	useEffect(() => {
		if (currentData) {
			form.setValue('full_name', currentData.full_name);
			form.setValue('position', currentData.position);
			form.setValue('phone_number', currentData.phone_number);
			form.setValue('status', currentData.status);
		}
	}, [currentData]);

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
