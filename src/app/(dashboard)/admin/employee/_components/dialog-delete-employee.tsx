import DialogDelete from '@/components/common/dialog-delete';
import { startTransition, useActionState, useEffect } from 'react';
import { deleteEmployee } from '../actions';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { toast } from 'sonner';
import { Employee } from '@/validations/employee-validation';

export default function DialogDeleteEmployee({
	open,
	refetch,
	currentData,
	handleChangeAction,
}: {
	refetch: () => void;
	currentData?: Employee;
	open: boolean;
	handleChangeAction: (open: boolean) => void;
}) {
	const [deleteEmployeeState, deleteEmployeeAction, isPendingdeleteEmployee] =
		useActionState(deleteEmployee, INITIAL_STATE_ACTION);

	const onSubmit = () => {
		const formData = new FormData();
		formData.append('id', currentData!.id as string);
		startTransition(() => {
			deleteEmployeeAction(formData);
		});
	};

	useEffect(() => {
		if (deleteEmployeeState?.status === 'error') {
			toast.error('Gagal Menghapus Karyawan', {
				description: deleteEmployeeState.errors?._form?.[0],
			});
		}

		if (deleteEmployeeState?.status === 'success') {
			toast.success('Karyawan Berhasil Dihapus');
			handleChangeAction?.(false);
			refetch();
		}
	}, [deleteEmployeeState]);

	return (
		<DialogDelete
			open={open}
			onOpenChange={handleChangeAction}
			isLoading={isPendingdeleteEmployee}
			onSubmit={onSubmit}
			title='Karyawan'
		/>
	);
}
