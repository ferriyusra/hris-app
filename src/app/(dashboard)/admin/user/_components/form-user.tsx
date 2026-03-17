import FormImage from '@/components/common/form-image';
import FormInput from '@/components/common/form-input';
import FormSelect from '@/components/common/form-select';
import FormCombobox from '@/components/common/form-combobox';
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
import { ROLE_LIST } from '@/constants/auth-constant';
import { Preview } from '@/types/general';
import { Loader2 } from 'lucide-react';
import { FormEvent } from 'react';
import { FieldValues, Path, UseFormReturn, useWatch } from 'react-hook-form';

export default function FormUser<T extends FieldValues>({
	form,
	onSubmit,
	isLoading,
	type,
	preview,
	setPreview,
	employees = [],
	isLoadingEmployees = false,
}: {
	form: UseFormReturn<T>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	isLoading: boolean;
	type: 'Tambah' | 'Update';
	preview?: Preview;
	setPreview?: (preview: Preview) => void;
	employees?: { id: string; full_name: string; position: string }[];
	isLoadingEmployees?: boolean;
}) {
	// Watch role field value
	const selectedRole = useWatch({
		control: form.control,
		name: 'role' as Path<T>,
	});

	const employeeOptions = employees.map((emp) => ({
		value: emp.id,
		label: `${emp.full_name} - ${emp.position}`,
	}));

	// Handler untuk auto-fill name ketika employee dipilih
	const handleEmployeeChange = (employeeId: string) => {
		const selectedEmployee = employees.find((emp) => emp.id === employeeId);
		if (selectedEmployee) {
			// Auto-fill name field dengan nama employee
			form.setValue('name' as Path<T>, selectedEmployee.full_name as any);
		}
	};

	// Check if role is "employee" (karyawan)
	const isEmployeeRole = selectedRole === 'employee';
	return (
		<DialogContent className='sm:max-w-[425px]'>
			<Form {...form}>
				<DialogHeader>
					<DialogTitle>{type} User</DialogTitle>
					<DialogDescription>
						{type === 'Tambah'
							? 'Tambah user baru'
							: 'Make changes user here'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className='space-y-4'>
					<FormInput
						form={form}
						name={'name' as Path<T>}
						label='Name'
						placeholder='Insert your name'
					/>
					{type === 'Tambah' && (
						<FormInput
							form={form}
							name={'email' as Path<T>}
							label='Email'
							placeholder='Insert email here'
							type='email'
						/>
					)}
					<FormImage
						form={form}
						name={'avatar_url' as Path<T>}
						label='Avatar'
						preview={preview}
						setPreview={setPreview}
					/>
					<FormSelect
						form={form}
						name={'role' as Path<T>}
						label='Role'
						selectItem={ROLE_LIST}
					/>
					{type === 'Tambah' && isEmployeeRole && (
						<>
							{isLoadingEmployees ? (
								<div className='space-y-2'>
									<label className='text-sm font-medium leading-none'>
										Pilih Karyawan
									</label>
									<div className='text-sm text-muted-foreground border rounded-md p-3 bg-muted flex items-center gap-2'>
										<Loader2 className='h-4 w-4 animate-spin' />
										Loading employees...
									</div>
								</div>
							) : employeeOptions.length > 0 ? (
								<FormCombobox
									form={form}
									name={'employee_id' as Path<T>}
									label='Pilih Karyawan'
									options={employeeOptions}
									onValueChange={handleEmployeeChange}
									placeholder='Pilih karyawan...'
									searchPlaceholder='Cari karyawan berdasarkan nama...'
									emptyText='Tidak ada karyawan ditemukan'
								/>
							) : (
								<div className='space-y-2'>
									<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
										Pilih Karyawan
									</label>
									<div className='text-sm text-muted-foreground border rounded-md p-3 bg-muted'>
										Tidak ada karyawan tersedia. Buat karyawan terlebih dahulu di menu
										Karyawan.
									</div>
								</div>
							)}
						</>
					)}
					{type === 'Tambah' && (
						<FormInput
							form={form}
							name={'password' as Path<T>}
							label='Password'
							placeholder='******'
							type='password'
						/>
					)}
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
