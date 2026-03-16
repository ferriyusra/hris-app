import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSalaryConfig, getEmployeesWithoutSalaryConfig } from '../actions';
import { toast } from 'sonner';
import {
	SalaryConfigForm,
	salaryConfigFormSchema,
} from '@/validations/salary-config-validation';
import {
	INITIAL_SALARY_CONFIG,
	INITIAL_STATE_SALARY_CONFIG,
} from '@/constants/payroll-constant';
import FormSalaryConfig from './form-salary-config';

export default function DialogCreateSalaryConfig({
	refetch,
}: {
	refetch: () => void;
}) {
	const [employeeOptions, setEmployeeOptions] = useState<
		{ value: string; label: string }[]
	>([]);

	const currentYear = new Date().getFullYear();

	const form = useForm<SalaryConfigForm>({
		resolver: zodResolver(salaryConfigFormSchema),
		defaultValues: {
			...INITIAL_SALARY_CONFIG,
			year: String(currentYear),
		},
	});

	const selectedYear = form.watch('year');

	const [state, action, isPending] = useActionState(
		createSalaryConfig,
		INITIAL_STATE_SALARY_CONFIG
	);

	const fetchEmployees = useCallback(async (year: number) => {
		const result = await getEmployeesWithoutSalaryConfig(year);
		if (result.data) {
			setEmployeeOptions(
				result.data.map((e) => ({
					value: e.id,
					label: `${e.full_name} - ${e.position}`,
				}))
			);
		}
	}, []);

	useEffect(() => {
		const year = Number(selectedYear);
		if (year >= 2020) {
			form.setValue('employee_id', '');
			fetchEmployees(year);
		}
	}, [selectedYear, fetchEmployees, form]);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value?.toString() || '0');
		});

		startTransition(() => {
			action(formData);
		});
	});

	useEffect(() => {
		if (state?.status === 'error') {
			toast.error('Gagal Membuat Konfigurasi Gaji', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Konfigurasi Gaji Berhasil Dibuat');
			form.reset();
			document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
			refetch();
		}
	}, [state]);

	const yearOptions = Array.from({ length: 5 }, (_, i) => ({
		value: String(currentYear - 2 + i),
		label: String(currentYear - 2 + i),
	}));

	return (
		<FormSalaryConfig
			form={form}
			onSubmit={onSubmit}
			isLoading={isPending}
			type='Tambah'
			employeeOptions={employeeOptions}
			yearOptions={yearOptions}
		/>
	);
}
