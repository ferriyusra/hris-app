import FormInput from '@/components/common/form-input';
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
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export default function FormSalaryConfig<T extends FieldValues>({
	form,
	onSubmit,
	isLoading,
	type,
	employeeOptions,
	yearOptions,
}: {
	form: UseFormReturn<T>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	isLoading: boolean;
	type: 'Tambah' | 'Ubah';
	employeeOptions: { value: string; label: string }[];
	yearOptions: { value: string; label: string }[];
}) {
	return (
		<DialogContent className='sm:max-w-[500px] max-h-[90vh]'>
			<Form {...form}>
				<DialogHeader>
					<DialogTitle>{type} Konfigurasi Gaji</DialogTitle>
					<DialogDescription>
						{type === 'Tambah'
							? 'Tambahkan konfigurasi gaji karyawan baru'
							: 'Ubah konfigurasi gaji karyawan'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className='space-y-4'>
					<div className='space-y-4 max-h-[50vh] px-1 overflow-y-auto'>
						<FormSelect
							form={form}
							name={'employee_id' as Path<T>}
							label='Karyawan'
							selectItem={employeeOptions}
						/>
						<FormSelect
							form={form}
							name={'year' as Path<T>}
							label='Tahun'
							selectItem={yearOptions}
						/>
						<FormInput
							form={form}
							name={'base_salary' as Path<T>}
							label='Gaji Pokok'
							placeholder='5000000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'transport_allowance' as Path<T>}
							label='Tunjangan Transport'
							placeholder='500000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'meal_allowance' as Path<T>}
							label='Tunjangan Makan'
							placeholder='500000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'late_deduction_per_day' as Path<T>}
							label='Potongan Terlambat/Hari'
							placeholder='50000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'absent_deduction_per_day' as Path<T>}
							label='Potongan Absen/Hari'
							placeholder='100000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'half_day_deduction_per_day' as Path<T>}
							label='Potongan Setengah Hari'
							placeholder='50000'
							type='number'
							min='0'
						/>
						<FormInput
							form={form}
							name={'overtime_rate_per_hour' as Path<T>}
							label='Tarif Lembur/Jam'
							placeholder='25000'
							type='number'
							min='0'
						/>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Batal</Button>
						</DialogClose>
						<Button type='submit'>
							{isLoading ? <Loader2 className='animate-spin' /> : type}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
