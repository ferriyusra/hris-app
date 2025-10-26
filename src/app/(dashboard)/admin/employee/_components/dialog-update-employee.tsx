import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
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

	const hasShownToastRef = useRef(false);

	const onSubmit = form.handleSubmit((data) => {
		if (!currentData?.id) {
			toast.error('Data karyawan tidak valid');
			return;
		}

		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});
		formData.append('id', currentData.id);

		// Reset the flag before submitting
		hasShownToastRef.current = false;

		startTransition(() => {
			updateEmployeeAction(formData);
		});
	});

	useEffect(() => {
		// Skip if we've already processed this state
		if (hasShownToastRef.current) return;

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
			toast.error('Gagal Mengubah Karyawan', {
				description: updateEmployeeState.errors?._form?.[0] || 'Silakan periksa form',
			});
			hasShownToastRef.current = true;
		}

		if (updateEmployeeState?.status === 'success') {
			toast.success('Karyawan Berhasil Diubah');
			form.reset();
			handleChangeAction?.(false);
			refetch();
			hasShownToastRef.current = true;
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
				type='Ubah'
			/>
		</Dialog>
	);
}
