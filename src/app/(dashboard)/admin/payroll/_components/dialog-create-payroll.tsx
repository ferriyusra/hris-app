import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createPayrollRun } from '../actions';
import { toast } from 'sonner';
import {
	PayrollForm,
	payrollFormSchema,
} from '@/validations/payroll-validation';
import {
	INITIAL_PAYROLL,
	INITIAL_STATE_PAYROLL,
	MONTH_NAMES,
} from '@/constants/payroll-constant';
import FormSelect from '@/components/common/form-select';
import { Button } from '@/components/ui/button';
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

export default function DialogCreatePayroll({
	refetch,
}: {
	refetch: () => void;
}) {
	const form = useForm<PayrollForm>({
		resolver: zodResolver(payrollFormSchema),
		defaultValues: INITIAL_PAYROLL,
	});

	const [state, action, isPending] = useActionState(
		createPayrollRun,
		INITIAL_STATE_PAYROLL
	);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		formData.append('month', data.month);
		formData.append('year', data.year);

		startTransition(() => {
			action(formData);
		});
	});

	useEffect(() => {
		if (state?.status === 'error') {
			toast.error('Gagal Membuat Penggajian', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Penggajian Berhasil Dibuat');
			form.reset();
			document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
			refetch();
		}
	}, [state]);

	const monthOptions = MONTH_NAMES.map((name, index) => ({
		value: String(index + 1),
		label: name,
	}));

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => ({
		value: String(currentYear - 2 + i),
		label: String(currentYear - 2 + i),
	}));

	return (
		<DialogContent className='sm:max-w-[425px]'>
			<Form {...form}>
				<DialogHeader>
					<DialogTitle>Buat Penggajian</DialogTitle>
					<DialogDescription>
						Pilih periode untuk menjalankan penggajian. Gaji akan dihitung
						otomatis berdasarkan data kehadiran.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className='space-y-4'>
					<FormSelect
						form={form}
						name='month'
						label='Bulan'
						selectItem={monthOptions}
					/>
					<FormSelect
						form={form}
						name='year'
						label='Tahun'
						selectItem={yearOptions}
					/>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Batal</Button>
						</DialogClose>
						<Button type='submit'>
							{isPending ? <Loader2 className='animate-spin' /> : 'Buat'}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
