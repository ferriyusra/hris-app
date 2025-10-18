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
	type: 'Create' | 'Update';
}) {
	return (
		<DialogContent className='sm:max-w-[425px] max-h-[90vh]'>
			<Form {...form}>
				<DialogHeader>
					<DialogTitle>{type} Table</DialogTitle>
					<DialogDescription>
						{type === 'Create' ? 'Add a new employee' : 'Make changes table here'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className='space-y-4'>
					<div className='space-y-4 max-h-[50vh] px-1 overflow-y-auto'>
						<FormInput
							form={form}
							name={'full_name' as Path<T>}
							label='Full Name'
							placeholder='Insert full name here'
						/>
						<FormInput
							form={form}
							name={'position' as Path<T>}
							label='Position'
							placeholder='Insert position here'
						/>
						<FormInput
							form={form}
							name={'phone_number' as Path<T>}
							label='Phone Number'
							placeholder='Insert phone number here'
						/>
						<FormSelect
							form={form}
							name={'is_active' as Path<T>}
							label='Status'
							selectItem={STATUS_TABLE_EMPLOYEE}
						/>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Cancel</Button>
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
