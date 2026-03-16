import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { updateSalaryConfig } from '../actions';
import { toast } from 'sonner';
import {
	SalaryConfigForm,
	salaryConfigFormSchema,
} from '@/validations/salary-config-validation';
import { INITIAL_STATE_SALARY_CONFIG } from '@/constants/payroll-constant';
import { SalaryConfig } from '@/types/payroll';
import { Dialog } from '@radix-ui/react-dialog';
import FormSalaryConfig from './form-salary-config';

export default function DialogUpdateSalaryConfig({
	refetch,
	currentData,
	open,
	handleChangeAction,
}: {
	refetch: () => void;
	currentData?: SalaryConfig;
	open?: boolean;
	handleChangeAction?: (open: boolean) => void;
}) {
	const form = useForm<SalaryConfigForm>({
		resolver: zodResolver(salaryConfigFormSchema),
	});

	const [state, action, isPending] = useActionState(
		updateSalaryConfig,
		INITIAL_STATE_SALARY_CONFIG
	);

	const hasShownToastRef = useRef(false);

	const onSubmit = form.handleSubmit((data) => {
		if (!currentData?.id) {
			toast.error('Data konfigurasi gaji tidak valid');
			return;
		}

		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value?.toString() || '0');
		});
		formData.append('id', currentData.id);

		hasShownToastRef.current = false;

		startTransition(() => {
			action(formData);
		});
	});

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state?.status === 'error') {
			toast.error('Gagal Mengubah Konfigurasi Gaji', {
				description: state.errors?._form?.[0] || 'Silakan periksa form',
			});
			hasShownToastRef.current = true;
		}

		if (state?.status === 'success') {
			toast.success('Konfigurasi Gaji Berhasil Diubah');
			form.reset();
			handleChangeAction?.(false);
			refetch();
			hasShownToastRef.current = true;
		}
	}, [state, form, handleChangeAction, refetch]);

	useEffect(() => {
		if (currentData) {
			form.setValue('employee_id', currentData.employee_id || '');
			form.setValue('base_salary', String(currentData.base_salary || 0));
			form.setValue(
				'transport_allowance',
				String(currentData.transport_allowance || 0)
			);
			form.setValue('meal_allowance', String(currentData.meal_allowance || 0));
			form.setValue(
				'late_deduction_per_day',
				String(currentData.late_deduction_per_day || 0)
			);
			form.setValue(
				'absent_deduction_per_day',
				String(currentData.absent_deduction_per_day || 0)
			);
			form.setValue(
				'half_day_deduction_per_day',
				String(currentData.half_day_deduction_per_day || 0)
			);
			form.setValue(
				'overtime_rate_per_hour',
				String(currentData.overtime_rate_per_hour || 0)
			);
			form.setValue('year', String(currentData.year || new Date().getFullYear()));
		} else {
			form.reset();
		}
	}, [currentData, form]);

	const employeeOptions = currentData?.employee
		? [
				{
					value: currentData.employee_id,
					label: `${currentData.employee.full_name} - ${currentData.employee.position}`,
					disabled: true,
				},
			]
		: [];

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => ({
		value: String(currentYear - 2 + i),
		label: String(currentYear - 2 + i),
	}));

	return (
		<Dialog open={open} onOpenChange={handleChangeAction}>
			<FormSalaryConfig
				form={form}
				onSubmit={onSubmit}
				isLoading={isPending}
				type='Ubah'
				employeeOptions={employeeOptions}
				yearOptions={yearOptions}
			/>
		</Dialog>
	);
}
