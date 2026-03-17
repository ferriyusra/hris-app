import FormInput from '@/components/common/form-input';
import FormPhoneInput from '@/components/common/form-phone-input';
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
import { STATUS_TABLE_EMPLOYEE } from '@/constants/employee-constant';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export default function FormEmployee<T extends FieldValues>({
	form,
	onSubmit,
	isLoading,
	type,
}: {
	form: UseFormReturn<T>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	isLoading: boolean;
	type: 'Tambah' | 'Ubah';
}) {
	return (
		<DialogContent className='sm:max-w-[425px] max-h-[90vh]'>
			<Form {...form}>
				<DialogHeader>
					<DialogTitle>{type} Karyawan</DialogTitle>
					<DialogDescription>
						{type === 'Tambah' ? 'Tambahkan karyawan baru' : 'Ubah data karyawan di sini'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className='space-y-4'>
					<div className='max-h-[50vh] px-1 overflow-y-auto'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<FormInput
								form={form}
								name={'full_name' as Path<T>}
								label='Nama Lengkap'
								placeholder='Masukkan nama lengkap'
							/>
							<FormInput
								form={form}
								name={'position' as Path<T>}
								label='Posisi'
								placeholder='Masukkan posisi'
							/>
							<FormPhoneInput
								form={form}
								name={'phone_number' as Path<T>}
								label='Nomor Telepon'
								placeholder='812-3456-7890'
							/>
							<FormSelect
								form={form}
								name={'is_active' as Path<T>}
								label='Status'
								selectItem={STATUS_TABLE_EMPLOYEE}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Batal</Button>
						</DialogClose>
						<Button type='submit' className='bg-gradient-to-r from-primary to-primary/80'>
							{isLoading ? <Loader2 className='animate-spin' /> : type}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
