import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createEmployee } from '../actions';
import { toast } from 'sonner';
import { TableForm, employeeFormSchema } from '@/validations/employee-validation';
import { INITIAL_STATE_EMPLOYEE, INITIAL_EMPLOYEE } from '@/constants/employee-constant';
import FormEmployee from './form-employee';

export default function DialogCreateEmployee({
	refetch,
}: {
	refetch: () => void;
}) {
	const form = useForm<TableForm>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: INITIAL_EMPLOYEE,
	});

	const [createEmployeeState, createEmployeeAction, isPendingcreateEmployee] =
		useActionState(createEmployee, INITIAL_STATE_EMPLOYEE);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});

		startTransition(() => {
			createEmployeeAction(formData);
		});
	});

	useEffect(() => {
		if (createEmployeeState?.status === 'error') {
			toast.error('Create Employee Failed', {
				description: createEmployeeState.errors?._form?.[0],
			});
		}

		if (createEmployeeState?.status === 'success') {
			toast.success('Create Employee Success');
			form.reset();
			document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
			refetch();
		}
	}, [createEmployeeState]);

	return (
		<FormEmployee
			form={form}
			onSubmit={onSubmit}
			isLoading={isPendingcreateEmployee}
			type='Create'
		/>
	);
}
